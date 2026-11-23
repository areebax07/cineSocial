export declare class RecommendationFeedbackDto {
    titleId?: string;
    tmdbId?: number;
    type?: 'movie' | 'tv';
    action: 'upvote' | 'dismiss';
}
