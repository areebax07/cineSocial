import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TitlesService } from '../titles/titles.service.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { UpdateMessageDto } from './dto/update-message.dto.js';
import { ListMessagesDto } from './dto/list-messages.dto.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';

const slimUser = { id: true, displayName: true, avatarUrl: true };
const slimTitle = {
  id: true,
  tmdbId: true,
  type: true,
  name: true,
  posterUrl: true,
  releaseYear: true,
  tmdbRating: true,
};
const messageInclude = {
  sender: { select: slimUser },
  sharedTitle: { select: slimTitle },
};
const conversationInclude = {
  participants: { include: { user: { select: slimUser } } },
};

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private titlesService: TitlesService,
  ) {}

  // ---------- helpers (also used by the gateway) ----------

  /** Returns the user id if the account exists and is active, else null. */
  async validateUser(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });
    return user?.status === 'active' ? user.id : null;
  }

  async getConversationIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    return rows.map((r) => r.conversationId);
  }

  private async assertMember(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (participant) return;

    const exists = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Conversation not found');
    throw new ForbiddenException('You are not a participant in this conversation');
  }

  private async assertActiveUsers(ids: string[]) {
    const count = await this.prisma.user.count({
      where: { id: { in: ids }, status: 'active' },
    });
    if (count !== ids.length) {
      throw new NotFoundException('One or more users were not found');
    }
  }

  private async resolveSharedTitle(dto: SendMessageDto): Promise<string | null> {
    if (dto.sharedTitleId) {
      const title = await this.prisma.title.findUnique({
        where: { id: dto.sharedTitleId },
        select: { id: true },
      });
      if (!title) throw new NotFoundException('Shared title not found');
      return title.id;
    }

    if (dto.tmdbId || dto.type) {
      if (!dto.tmdbId || !dto.type) {
        throw new BadRequestException('Provide both tmdbId and type ("movie" | "tv")');
      }
      const existing = await this.prisma.title.findUnique({
        where: { tmdbId: dto.tmdbId },
        select: { id: true },
      });
      if (existing) return existing.id;

      const cached = await this.titlesService.getTitleDetailsAndCache(
        dto.type,
        dto.tmdbId,
      );
      return cached.id;
    }

    return null;
  }

  // ---------- conversations ----------

  async createConversation(userId: string, dto: CreateConversationDto) {
    const others = [...new Set(dto.participantIds)].filter((id) => id !== userId);

    if (dto.type === 'direct') {
      if (others.length !== 1) {
        throw new BadRequestException(
          'A direct conversation needs exactly one other user',
        );
      }
    } else {
      if (others.length < 2) {
        throw new BadRequestException('A group needs at least two other users');
      }
      if (!dto.name?.trim()) {
        throw new BadRequestException('A group conversation needs a name');
      }
    }

    await this.assertActiveUsers(others);

    if (dto.type === 'direct') {
      const existing = await this.prisma.conversation.findFirst({
        where: {
          type: 'direct',
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: others[0] } } },
          ],
        },
        include: conversationInclude,
      });
      if (existing) return { conversation: existing, created: false };
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        type: dto.type,
        name: dto.type === 'group' ? dto.name!.trim() : null,
        participants: {
          create: [userId, ...others].map((id) => ({ userId: id })),
        },
      },
      include: conversationInclude,
    });
    return { conversation, created: true };
  }

  // Sorted by latest activity. Sorting happens in memory because Prisma can't
  // order by a relation's max(sentAt); a user's conversation count stays small.
  async listConversations(userId: string, dto: PaginationQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const rows = await this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        ...conversationInclude,
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          include: messageInclude,
        },
      },
    });

    const sorted = rows
      .map(({ messages, ...c }) => ({ ...c, lastMessage: messages[0] ?? null }))
      .sort(
        (a, b) =>
          (b.lastMessage?.sentAt ?? b.createdAt).getTime() -
          (a.lastMessage?.sentAt ?? a.createdAt).getTime(),
      );

    const skip = (page - 1) * limit;
    return {
      page,
      limit,
      total: sorted.length,
      totalPages: Math.ceil(sorted.length / limit),
      items: sorted.slice(skip, skip + limit),
    };
  }

  async addParticipants(userId: string, conversationId: string, userIds: string[]) {
    await this.assertMember(conversationId, userId);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { type: true },
    });
    if (conversation!.type !== 'group') {
      throw new BadRequestException('You can only add people to group conversations');
    }

    const ids = [...new Set(userIds)].filter((id) => id !== userId);
    await this.assertActiveUsers(ids);

    const already = await this.prisma.conversationParticipant.findMany({
      where: { conversationId, userId: { in: ids } },
      select: { userId: true },
    });
    const alreadySet = new Set(already.map((p) => p.userId));
    const addedUserIds = ids.filter((id) => !alreadySet.has(id));

    if (addedUserIds.length > 0) {
      await this.prisma.conversationParticipant.createMany({
        data: addedUserIds.map((id) => ({ conversationId, userId: id })),
        skipDuplicates: true,
      });
    }

    const updated = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: conversationInclude,
    });
    return { conversation: updated!, addedUserIds };
  }

  async leaveConversation(userId: string, conversationId: string) {
    await this.assertMember(conversationId, userId);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { type: true },
    });
    if (conversation!.type !== 'group') {
      throw new BadRequestException('You cannot leave a direct conversation');
    }

    await this.prisma.conversationParticipant.delete({
      where: { conversationId_userId: { conversationId, userId } },
    });
    return { message: 'You left the conversation' };
  }

  // ---------- messages ----------

  async getMessages(userId: string, conversationId: string, dto: ListMessagesDto) {
    await this.assertMember(conversationId, userId);
    const limit = dto.limit ?? 30;

    const items = await this.prisma.message.findMany({
      where: {
        conversationId,
        ...(dto.before && { sentAt: { lt: new Date(dto.before) } }),
      },
      include: messageInclude,
      orderBy: { sentAt: 'desc' },
      take: limit,
    });

    return {
      items,
      nextCursor:
        items.length === limit ? items[items.length - 1].sentAt.toISOString() : null,
    };
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    await this.assertMember(dto.conversationId, userId);

    const body = (dto.body ?? '').trim();
    const hasShare = Boolean(dto.sharedTitleId || dto.tmdbId || dto.type);
    if (!body && !hasShare) {
      throw new BadRequestException('A message needs text or a shared title');
    }

    const sharedTitleId = await this.resolveSharedTitle(dto);

    return this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId: userId,
        body,
        sharedTitleId,
      },
      include: messageInclude,
    });
  }

  private async getOwnMessage(userId: string, id: string, action: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException(`You can only ${action} your own message`);
    }
    return message;
  }

  async editMessage(userId: string, id: string, dto: UpdateMessageDto) {
    await this.getOwnMessage(userId, id, 'edit');

    return this.prisma.message.update({
      where: { id },
      data: { body: dto.body.trim(), editedAt: new Date() },
      include: messageInclude,
    });
  }

  async deleteMessage(userId: string, id: string) {
    const message = await this.getOwnMessage(userId, id, 'delete');
    await this.prisma.message.delete({ where: { id } });
    return { id, conversationId: message.conversationId };
  }
}