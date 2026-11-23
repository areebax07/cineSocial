import { PrismaService } from '../prisma/prisma.service.js';
import { TitlesService } from '../titles/titles.service.js';
import { RecommendationFeedbackDto } from './dto/recommendation-feedback.dto.js';
export declare class RecommendationsService {
    private prisma;
    private titlesService;
    constructor(prisma: PrismaService, titlesService: TitlesService);
    getPersonalizedRails(userId: string): Promise<{
        matchedGenres: string[];
        moodTags: string[];
        rails: {
            forYou: any;
            fromFriends: {
                recommendedBy: {
                    displayName: string;
                    id: string;
                    avatarUrl: string | null;
                };
                friendRating: number;
                type: string;
                id: string;
                name: string;
                tmdbId: number;
                synopsis: string | null;
                releaseYear: number | null;
                runtime: number | null;
                posterUrl: string | null;
                trailerKey: string | null;
                tmdbRating: number | null;
                updatedAt: Date;
            }[];
            trendingForYou: any;
        };
    }>;
    submitFeedback(userId: string, dto: RecommendationFeedbackDto): Promise<{
        title: {
            type: string;
            id: string;
            name: string;
            tmdbId: number;
            synopsis: string | null;
            releaseYear: number | null;
            runtime: number | null;
            posterUrl: string | null;
            trailerKey: string | null;
            tmdbRating: number | null;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        titleId: string;
        userId: string;
        action: string;
    }>;
    getMyFeedback(userId: string): Promise<({
        title: {
            type: string;
            id: string;
            name: string;
            tmdbId: number;
            synopsis: string | null;
            releaseYear: number | null;
            runtime: number | null;
            posterUrl: string | null;
            trailerKey: string | null;
            tmdbRating: number | null;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        titleId: string;
        userId: string;
        action: string;
    })[]>;
    removeFeedback(userId: string, titleId: string): Promise<{
        message: string;
    }>;
}
