import { RecommendationsService } from './recommendations.service.js';
import { RecommendationFeedbackDto } from './dto/recommendation-feedback.dto.js';
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    getRecommendations(req: any): Promise<{
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
    submitFeedback(req: any, dto: RecommendationFeedbackDto): Promise<{
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
    getMyFeedback(req: any): Promise<({
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
    removeFeedback(req: any, titleId: string): Promise<{
        message: string;
    }>;
}
