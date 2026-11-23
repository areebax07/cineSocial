var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TitlesService } from '../titles/titles.service.js';
let WatchlistService = class WatchlistService {
    prisma;
    titlesService;
    constructor(prisma, titlesService) {
        this.prisma = prisma;
        this.titlesService = titlesService;
    }
    async addToWatchlist(userId, dto) {
        let resolvedTitleId = dto.titleId;
        if (!resolvedTitleId) {
            if (!dto.tmdbId || !dto.type) {
                throw new BadRequestException('Provide either titleId OR both tmdbId and type ("movie" | "tv")');
            }
            const existing = await this.prisma.title.findUnique({
                where: { tmdbId: dto.tmdbId },
            });
            if (existing) {
                resolvedTitleId = existing.id;
            }
            else {
                const cached = await this.titlesService.getTitleDetailsAndCache(dto.type, dto.tmdbId);
                resolvedTitleId = cached.id;
            }
        }
        else {
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
    async getMyWatchlist(userId, status) {
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
    async checkTitleStatus(userId, titleId) {
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
    async updateStatus(userId, entryId, dto) {
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
    async removeFromWatchlist(userId, entryId) {
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
    async getUserWatchlist(targetUserId, viewerUserId) {
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
                    throw new ForbiddenException('This watchlist is only visible to followers');
                }
            }
        }
        return this.getMyWatchlist(targetUserId);
    }
};
WatchlistService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        TitlesService])
], WatchlistService);
export { WatchlistService };
//# sourceMappingURL=watchlist.service.js.map