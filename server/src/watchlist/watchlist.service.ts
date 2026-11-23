import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TitlesService } from '../titles/titles.service.js';
import { AddWatchlistDto } from './dto/add-watchlist.dto.js';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto.js';

@Injectable()
export class WatchlistService {
  constructor(
    private prisma: PrismaService,
    private titlesService: TitlesService,
  ) {}

  async addToWatchlist(userId: string, dto: AddWatchlistDto) {
    let resolvedTitleId = dto.titleId;

    if (!resolvedTitleId) {
      if (!dto.tmdbId || !dto.type) {
        throw new BadRequestException(
          'Provide either titleId OR both tmdbId and type ("movie" | "tv")',
        );
      }

      // Check if already cached in Supabase, otherwise fetch & cache from TMDB
      const existing = await this.prisma.title.findUnique({
        where: { tmdbId: dto.tmdbId },
      });

      if (existing) {
        resolvedTitleId = existing.id;
      } else {
        const cached = await this.titlesService.getTitleDetailsAndCache(
          dto.type,
          dto.tmdbId,
        );
        resolvedTitleId = cached.id;
      }
    } else {
      const titleExists = await this.prisma.title.findUnique({
        where: { id: resolvedTitleId },
      });
      if (!titleExists) {
        throw new NotFoundException('Title not found');
      }
    }

    const status = dto.status || 'want_to_watch';

    return this.prisma.watchlistEntry.upsert({
      where: {
        userId_titleId: {
          userId,
          titleId: resolvedTitleId,
        },
      },
      update: { status },
      create: {
        userId,
        titleId: resolvedTitleId,
        status,
      },
      include: {
        title: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
    });
  }

  async getMyWatchlist(userId: string, status?: 'want_to_watch' | 'seen') {
    const entries = await this.prisma.watchlistEntry.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      include: {
        title: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    const [wantToWatchCount, seenCount] = await Promise.all([
      this.prisma.watchlistEntry.count({
        where: { userId, status: 'want_to_watch' },
      }),
      this.prisma.watchlistEntry.count({
        where: { userId, status: 'seen' },
      }),
    ]);

    return {
      counts: {
        total: wantToWatchCount + seenCount,
        wantToWatch: wantToWatchCount,
        seen: seenCount,
      },
      items: entries,
    };
  }

  async checkTitleStatus(userId: string, titleId: string) {
    const entry = await this.prisma.watchlistEntry.findUnique({
      where: {
        userId_titleId: { userId, titleId },
      },
    });

    return {
      inWatchlist: Boolean(entry),
      entryId: entry?.id ?? null,
      status: entry?.status ?? null,
    };
  }

  async updateStatus(userId: string, entryId: string, dto: UpdateWatchlistDto) {
    const entry = await this.prisma.watchlistEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Watchlist entry not found');
    }
    if (entry.userId !== userId) {
      throw new ForbiddenException('You can only update your own watchlist');
    }

    return this.prisma.watchlistEntry.update({
      where: { id: entryId },
      data: { status: dto.status },
      include: {
        title: true,
      },
    });
  }

  async removeFromWatchlist(userId: string, entryId: string) {
    const entry = await this.prisma.watchlistEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Watchlist entry not found');
    }
    if (entry.userId !== userId) {
      throw new ForbiddenException('You can only remove items from your own watchlist');
    }

    await this.prisma.watchlistEntry.delete({
      where: { id: entryId },
    });

    return { message: 'Removed from watchlist' };
  }

  async getUserWatchlist(targetUserId: string, viewerUserId: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser || targetUser.status !== 'active') {
      throw new NotFoundException('User not found');
    }

    if (targetUserId !== viewerUserId) {
      if (targetUser.profileVisibility === 'private') {
        throw new ForbiddenException('This user watchlist is private');
      }
      if (targetUser.profileVisibility === 'friends') {
        const isFollowing = await this.prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerUserId,
              followingId: targetUserId,
            },
          },
        });
        if (!isFollowing) {
          throw new ForbiddenException(
            'This watchlist is only visible to followers',
          );
        }
      }
    }

    return this.getMyWatchlist(targetUserId);
  }
}