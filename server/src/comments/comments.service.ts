import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { ListCommentsDto } from './dto/list-comments.dto.js';

const userSelect = { id: true, displayName: true, avatarUrl: true };

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCommentDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: dto.reviewId },
      select: { id: true },
    });
    if (!review) throw new NotFoundException('Review not found');

    if (dto.parentCommentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentCommentId },
        select: { reviewId: true },
      });
      if (!parent) throw new NotFoundException('Parent comment not found');
      if (parent.reviewId !== dto.reviewId) {
        throw new BadRequestException(
          'Parent comment belongs to a different review',
        );
      }
    }

    return this.prisma.comment.create({
      data: {
        reviewId: dto.reviewId,
        userId,
        parentCommentId: dto.parentCommentId ?? null,
        body: dto.body,
      },
      include: { user: { select: userSelect } },
    });
  }

  // Paginates top-level comments, then nests every reply under its parent.
  async findAll(dto: ListCommentsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const review = await this.prisma.review.findUnique({
      where: { id: dto.reviewId },
      select: { id: true },
    });
    if (!review) throw new NotFoundException('Review not found');

    const topWhere = { reviewId: dto.reviewId, parentCommentId: null };

    const [total, topLevel, replies] = await Promise.all([
      this.prisma.comment.count({ where: topWhere }),
      this.prisma.comment.findMany({
        where: topWhere,
        include: { user: { select: userSelect } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.comment.findMany({
        where: { reviewId: dto.reviewId, parentCommentId: { not: null } },
        include: { user: { select: userSelect } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const nodes = new Map<string, any>();
    for (const c of [...topLevel, ...replies]) {
      nodes.set(c.id, { ...c, replies: [] });
    }
    for (const r of replies) {
      nodes.get(r.parentCommentId!)?.replies.push(nodes.get(r.id));
    }

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: topLevel.map((c) => nodes.get(c.id)),
    };
  }

  async update(userId: string, id: string, dto: UpdateCommentDto) {
    await this.assertOwner(userId, id, 'edit');

    return this.prisma.comment.update({
      where: { id },
      data: { body: dto.body },
      include: { user: { select: userSelect } },
    });
  }

  // Replies are removed automatically (onDelete: Cascade on parentCommentId).
  async remove(userId: string, id: string) {
    await this.assertOwner(userId, id, 'delete');

    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Comment deleted' };
  }

  private async assertOwner(userId: string, id: string, action: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) {
      throw new ForbiddenException(`You can only ${action} your own comment`);
    }
  }
}