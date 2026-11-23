var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TitlesService } from '../titles/titles.service.js';
let RecommendationsService = class RecommendationsService {
    prisma;
    titlesService;
    constructor(prisma, titlesService) {
        this.prisma = prisma;
        this.titlesService = titlesService;
    }
    async getPersonalizedRails(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { favouriteGenres: true, moodTags: true },
        });
        const [feedbackList, watchlistEntries] = await Promise.all([
            this.prisma.recommendationFeedback.findMany({
                where: { userId },
                include: { title: { select: { tmdbId: true } } },
            }),
            this.prisma.watchlistEntry.findMany({
                where: { userId },
                include: { title: true },
                orderBy: { addedAt: 'desc' },
            }),
        ]);
        const excludedTmdbIds = new Set([
            ...feedbackList
                .filter((f) => f.action === 'dismiss')
                .map((f) => f.title.tmdbId),
            ...watchlistEntries
                .filter((w) => w.status === 'seen')
                .map((w) => w.title.tmdbId),
        ]);
        const allGenres = await this.titlesService.getGenres();
        const userGenreNames = (user?.favouriteGenres || []).map((g) => g.toLowerCase());
        const matchedGenreIds = allGenres
            .filter((g) => userGenreNames.some((ug) => g.name.toLowerCase().includes(ug) ||
            ug.includes(g.name.toLowerCase())))
            .map((g) => g.id);
        const tasteDiscover = await this.titlesService.discover({
            type: 'movie',
            genreId: matchedGenreIds.length > 0 ? matchedGenreIds.join('|') : undefined,
            minRating: 7.0,
            sortBy: 'popularity.desc',
            page: 1,
        });
        const forYou = tasteDiscover.results
            .filter((item) => !excludedTmdbIds.has(item.tmdbId))
            .slice(0, 12);
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const followingIds = following.map((f) => f.followingId);
        const friendReviews = followingIds.length > 0
            ? await this.prisma.review.findMany({
                where: {
                    userId: { in: followingIds },
                    rating: { gte: 4 },
                },
                include: {
                    title: true,
                    user: { select: { id: true, displayName: true, avatarUrl: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 15,
            })
            : [];
        const fromFriends = friendReviews
            .filter((r) => !excludedTmdbIds.has(r.title.tmdbId))
            .map((r) => ({
            ...r.title,
            recommendedBy: r.user,
            friendRating: r.rating,
        }));
        const trending = await this.titlesService.getTrending('all', 'week', 1);
        const trendingForYou = trending.results
            .filter((item) => !excludedTmdbIds.has(item.tmdbId))
            .slice(0, 12);
        return {
            matchedGenres: user?.favouriteGenres || [],
            moodTags: user?.moodTags || [],
            rails: {
                forYou,
                fromFriends,
                trendingForYou,
            },
        };
    }
    async submitFeedback(userId, dto) {
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
        return this.prisma.recommendationFeedback.upsert({
            where: {
                userId_titleId: {
                    userId,
                    titleId: resolvedTitleId,
                },
            },
            update: { action: dto.action },
            create: {
                userId,
                titleId: resolvedTitleId,
                action: dto.action,
            },
            include: {
                title: true,
            },
        });
    }
    async getMyFeedback(userId) {
        return this.prisma.recommendationFeedback.findMany({
            where: { userId },
            include: { title: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async removeFeedback(userId, titleId) {
        const existing = await this.prisma.recommendationFeedback.findUnique({
            where: {
                userId_titleId: { userId, titleId },
            },
        });
        if (!existing) {
            throw new NotFoundException('Feedback entry not found');
        }
        await this.prisma.recommendationFeedback.delete({
            where: {
                userId_titleId: { userId, titleId },
            },
        });
        return { message: 'Recommendation feedback removed' };
    }
};
RecommendationsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        TitlesService])
], RecommendationsService);
export { RecommendationsService };
//# sourceMappingURL=recommendations.service.js.map