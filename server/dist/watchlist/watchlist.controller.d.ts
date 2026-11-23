import { WatchlistService } from './watchlist.service.js';
import { AddWatchlistDto } from './dto/add-watchlist.dto.js';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto.js';
export declare class WatchlistController {
    private readonly watchlistService;
    constructor(watchlistService: WatchlistService);
    addToWatchlist(req: any, dto: AddWatchlistDto): Promise<{
        title: {
            genres: ({
                genre: {
                    id: number;
                    name: string;
                };
            } & {
                genreId: number;
                titleId: string;
            })[];
        } & {
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
        status: string;
        titleId: string;
        userId: string;
        addedAt: Date;
    }>;
    getMyWatchlist(req: any, status?: 'want_to_watch' | 'seen'): Promise<{
        counts: {
            total: number;
            wantToWatch: number;
            seen: number;
        };
        items: ({
            title: {
                genres: ({
                    genre: {
                        id: number;
                        name: string;
                    };
                } & {
                    genreId: number;
                    titleId: string;
                })[];
            } & {
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
            status: string;
            titleId: string;
            userId: string;
            addedAt: Date;
        })[];
    }>;
    checkTitleStatus(req: any, titleId: string): Promise<{
        inWatchlist: boolean;
        entryId: string | null;
        status: string | null;
    }>;
    getUserWatchlist(userId: string, req: any): Promise<{
        counts: {
            total: number;
            wantToWatch: number;
            seen: number;
        };
        items: ({
            title: {
                genres: ({
                    genre: {
                        id: number;
                        name: string;
                    };
                } & {
                    genreId: number;
                    titleId: string;
                })[];
            } & {
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
            status: string;
            titleId: string;
            userId: string;
            addedAt: Date;
        })[];
    }>;
    updateStatus(req: any, id: string, dto: UpdateWatchlistDto): Promise<{
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
        status: string;
        titleId: string;
        userId: string;
        addedAt: Date;
    }>;
    removeFromWatchlist(req: any, id: string): Promise<{
        message: string;
    }>;
}
