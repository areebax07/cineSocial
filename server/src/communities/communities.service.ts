import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCommunityDto } from './dto/create-community.dto.js';
import { UpdateCommunityDto } from './dto/update-community.dto.js';
import { ListCommunitiesDto } from './dto/list-communities.dto.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

const slimUser = { id: true, displayName: true, avatarUrl: true };

const isDuplicate = (e: unknown) => (e as any)?.code === 'P2002';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  // ---------- helpers ----------

  private async getCommunity(id: string) {
    const community = await this.prisma.community.findUnique({ where: { id } });
    if (!community) throw new NotFoundException('Community not found');
    return community;
  }

  private getMembership(communityId: string, userId: string) {
    return this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
  }

  private async assertOwner(communityId: string, userId: string) {
    const community = await this.getCommunity(communityId);
    if (community.ownerId !== userId) {
      throw new ForbiddenException('Only the community owner can do this');
    }
    return community;
  }

  private page(dto: PaginationQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    return { page, limit, skip: (page - 1) * limit };
  }

  // ---------- communities ----------

  async create(userId: string, dto: CreateCommunityDto) {
    try {
      return await this.prisma.community.create({
        data: {
          ownerId: userId,
          name: dto.name.trim(),
          description: dto.description,
          members: { create: { userId, role: 'owner' } },
        },
        include: { _count: { select: { members: true, posts: true } } },
      });
    } catch (e) {
      if (isDuplicate(e)) {
        throw new ConflictException('A community with this name already exists');
      }
      throw e;
    }
  }

  async findAll(userId: string, dto: ListCommunitiesDto) {
    const { page, limit, skip } = this.page(dto);
    const where = dto.q?.trim()
      ? { name: { contains: dto.q.trim(), mode: 'insensitive' as const } }
      : {};

    const [total, rows] = await Promise.all([
      this.prisma.community.count({ where }),
      this.prisma.community.findMany({
        where,
        include: {
          _count: { select: { members: true, posts: true } },
          members: { where: { userId }, select: { role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: rows.map(({ members, ...c }) => ({
        ...c,
        isMember: members.length > 0,
        myRole: members[0]?.role ?? null,
      })),
    };
  }

  async findOne(userId: string, id: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        owner: { select: slimUser },
        _count: { select: { members: true, posts: true } },
        members: { where: { userId }, select: { role: true } },
      },
    });
    if (!community) throw new NotFoundException('Community not found');

    const { members, ...rest } = community;
    return { ...rest, isMember: members.length > 0, myRole: members[0]?.role ?? null };
  }

  async update(userId: string, id: string, dto: UpdateCommunityDto) {
    await this.assertOwner(id, userId);
    try {
      return await this.prisma.community.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name.trim() }),
          ...(dto.description !== undefined && { description: dto.description }),
        },
      });
    } catch (e) {
      if (isDuplicate(e)) {
        throw new ConflictException('A community with this name already exists');
      }
      throw e;
    }
  }

  // Members and posts are removed via onDelete: Cascade in the schema.
  async remove(userId: string, id: string) {
    await this.assertOwner(id, userId);
    await this.prisma.community.delete({ where: { id } });
    return { message: 'Community deleted' };
  }

  // ---------- membership ----------

  async join(userId: string, id: string) {
    await this.getCommunity(id);
    await this.prisma.communityMember.createMany({
      data: [{ communityId: id, userId, role: 'member' }],
      skipDuplicates: true,
    });
    const membership = await this.getMembership(id, userId);
    return { joined: true, role: membership!.role };
  }

  async leave(userId: string, id: string) {
    await this.getCommunity(id);
    const membership = await this.getMembership(id, userId);
    if (!membership) return { left: true };

    if (membership.role === 'owner') {
      throw new BadRequestException(
        'The owner cannot leave. Transfer ownership to another member or delete the community.',
      );
    }

    await this.prisma.communityMember.delete({
      where: { communityId_userId: { communityId: id, userId } },
    });
    return { left: true };
  }

  async getMembers(id: string, dto: PaginationQueryDto) {
    await this.getCommunity(id);
    const { page, limit, skip } = this.page(dto);
    const where = { communityId: id };

    const [total, rows] = await Promise.all([
      this.prisma.communityMember.count({ where }),
      this.prisma.communityMember.findMany({
        where,
        include: { user: { select: slimUser } },
        orderBy: { joinedAt: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: rows.map((m) => ({ ...m.user, role: m.role, joinedAt: m.joinedAt })),
    };
  }

  async updateMemberRole(
    actorId: string,
    id: string,
    targetId: string,
    dto: UpdateMemberRoleDto,
  ) {
    await this.assertOwner(id, actorId);
    if (targetId === actorId) {
      throw new BadRequestException('You cannot change your own role');
    }

    const target = await this.getMembership(id, targetId);
    if (!target) throw new NotFoundException('That user is not a member of this community');

    const key = (userId: string) => ({ communityId_userId: { communityId: id, userId } });

    if (dto.role === 'owner') {
      // Ownership transfer: new owner, old owner becomes moderator
      await this.prisma.$transaction([
        this.prisma.communityMember.update({ where: key(targetId), data: { role: 'owner' } }),
        this.prisma.communityMember.update({ where: key(actorId), data: { role: 'moderator' } }),
        this.prisma.community.update({ where: { id }, data: { ownerId: targetId } }),
      ]);
      return { userId: targetId, role: 'owner' };
    }

    await this.prisma.communityMember.update({
      where: key(targetId),
      data: { role: dto.role },
    });
    return { userId: targetId, role: dto.role };
  }

  // ---------- discussion posts ----------

  async createPost(userId: string, id: string, dto: CreatePostDto) {
    await this.getCommunity(id);
    const membership = await this.getMembership(id, userId);
    if (!membership) {
      throw new ForbiddenException('Join this community to post');
    }

    return this.prisma.discussionPost.create({
      data: { communityId: id, authorId: userId, title: dto.title, body: dto.body },
      include: { author: { select: slimUser } },
    });
  }

  async listPosts(id: string, dto: PaginationQueryDto) {
    await this.getCommunity(id);
    const { page, limit, skip } = this.page(dto);
    const where = { communityId: id };

    const [total, items] = await Promise.all([
      this.prisma.discussionPost.count({ where }),
      this.prisma.discussionPost.findMany({
        where,
        include: { author: { select: slimUser } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { page, limit, total, totalPages: Math.ceil(total / limit), items };
  }

  private async getPost(communityId: string, postId: string) {
    const post = await this.prisma.discussionPost.findFirst({
      where: { id: postId, communityId },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async getOnePost(id: string, postId: string) {
    const post = await this.prisma.discussionPost.findFirst({
      where: { id: postId, communityId: id },
      include: { author: { select: slimUser } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async updatePost(userId: string, id: string, postId: string, dto: UpdatePostDto) {
    const post = await this.getPost(id, postId);
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own post');
    }

    return this.prisma.discussionPost.update({
      where: { id: postId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.body !== undefined && { body: dto.body }),
      },
      include: { author: { select: slimUser } },
    });
  }

  // Author, moderators and the owner can delete.
  async removePost(userId: string, id: string, postId: string) {
    const post = await this.getPost(id, postId);

    if (post.authorId !== userId) {
      const membership = await this.getMembership(id, userId);
      if (!membership || membership.role === 'member') {
        throw new ForbiddenException(
          'Only the author, a moderator or the owner can delete this post',
        );
      }
    }

    await this.prisma.discussionPost.delete({ where: { id: postId } });
    return { message: 'Post deleted' };
  }
}