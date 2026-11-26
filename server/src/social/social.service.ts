import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { SearchUsersDto } from './dto/search-users.dto.js';
import { FeedQueryDto } from './dto/feed-query.dto.js';

const userSelect = { id: true, displayName: true, avatarUrl: true, bio: true };
const slimUser = { id: true, displayName: true, avatarUrl: true };
const slimTitle = {
  id: true,
  tmdbId: true,
  type: true,
  name: true,
  posterUrl: true,
  releaseYear: true,
};

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  private async assertActiveUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!user || user.status !== 'active') {
      throw new NotFoundException('User not found');
    }
  }

  // Which of `ids` does the viewer follow? Used to flag list items.
  private async followedSet(viewerId: string, ids: string[]) {
    if (ids.length === 0) return new Set<string>();
    const rows = await this.prisma.follow.findMany({
      where: { followerId: viewerId, followingId: { in: ids } },
      select: { followingId: true },
    });
    return new Set(rows.map((r) => r.followingId));
  }

  async follow(followerId: string, targetId: string) {
    if (followerId === targetId) {
      throw new BadRequestException('You cannot follow yourself');
    }
    await this.assertActiveUser(targetId);

    // skipDuplicates makes a repeat follow a harmless no-op
    await this.prisma.follow.createMany({
      data: [{ followerId, followingId: targetId }],
      skipDuplicates: true,
    });

    const followerCount = await this.prisma.follow.count({
      where: { followingId: targetId },
    });
    return { following: true, followerCount };
  }

  async unfollow(followerId: string, targetId: string) {
    await this.prisma.follow.deleteMany({
      where: { followerId, followingId: targetId },
    });

    const followerCount = await this.prisma.follow.count({
      where: { followingId: targetId },
    });
    return { following: false, followerCount };
  }

  async getFollowers(userId: string, viewerId: string, dto: PaginationQueryDto) {
    await this.assertActiveUser(userId);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const where = { followingId: userId, follower: { status: 'active' } };

    const [total, rows] = await Promise.all([
      this.prisma.follow.count({ where }),
      this.prisma.follow.findMany({
        where,
        include: { follower: { select: userSelect } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const mine = await this.followedSet(viewerId, rows.map((r) => r.followerId));
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: rows.map((r) => ({
        ...r.follower,
        followedAt: r.createdAt,
        isFollowedByMe: mine.has(r.followerId),
      })),
    };
  }

  async getFollowing(userId: string, viewerId: string, dto: PaginationQueryDto) {
    await this.assertActiveUser(userId);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const where = { followerId: userId, following: { status: 'active' } };

    const [total, rows] = await Promise.all([
      this.prisma.follow.count({ where }),
      this.prisma.follow.findMany({
        where,
        include: { following: { select: userSelect } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const mine = await this.followedSet(viewerId, rows.map((r) => r.followingId));
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: rows.map((r) => ({
        ...r.following,
        followedAt: r.createdAt,
        isFollowedByMe: mine.has(r.followingId),
      })),
    };
  }

  async searchUsers(viewerId: string, dto: SearchUsersDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const where = {
      status: 'active',
      id: { not: viewerId },
      displayName: { contains: dto.q.trim(), mode: 'insensitive' as const },
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: { ...userSelect, favouriteGenres: true },
        orderBy: { displayName: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const mine = await this.followedSet(viewerId, users.map((u) => u.id));
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: users.map((u) => ({ ...u, isFollowing: mine.has(u.id) })),
    };
  }

  // Cursor-paginated feed: newest reviews + watchlist adds from people you follow.
  async getFeed(userId: string, dto: FeedQueryDto) {
    const limit = dto.limit ?? 20;
    const before = dto.before ? new Date(dto.before) : undefined;

    // Followed users who are active and haven't made their profile private
    const follows = await this.prisma.follow.findMany({
      where: {
        followerId: userId,
        following: { status: 'active', profileVisibility: { not: 'private' } },
      },
      select: { followingId: true },
    });
    const ids = follows.map((f) => f.followingId);
    if (ids.length === 0) return { items: [], nextCursor: null };

    const [reviews, entries] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          userId: { in: ids },
          ...(before && { createdAt: { lt: before } }),
        },
        include: {
          user: { select: slimUser },
          title: { select: slimTitle },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.watchlistEntry.findMany({
        where: {
          userId: { in: ids },
          ...(before && { addedAt: { lt: before } }),
        },
        include: {
          user: { select: slimUser },
          title: { select: slimTitle },
        },
        orderBy: { addedAt: 'desc' },
        take: limit,
      }),
    ]);

    const merged = [
      ...reviews.map((r) => ({
        type: 'review' as const,
        id: r.id,
        createdAt: r.createdAt,
        user: r.user,
        title: r.title,
        rating: r.rating,
        body: r.body,
        likeCount: r._count.likes,
        commentCount: r._count.comments,
      })),
      ...entries.map((w) => ({
        type: 'watchlist' as const,
        id: w.id,
        createdAt: w.addedAt,
        user: w.user,
        title: w.title,
        status: w.status,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return {
      items: merged,
      nextCursor:
        merged.length === limit
          ? merged[merged.length - 1].createdAt.toISOString()
          : null,
    };
  }
}