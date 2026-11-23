import { PrismaService } from '../prisma/prisma.service.js';
import { TitlesService } from '../titles/titles.service.js';
import { AddWatchlistDto } from './dto/add-watchlist.dto.js';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto.js';
export declare class WatchlistService {
    private prisma;
    private titlesService;
    constructor(prisma: PrismaService, titlesService: TitlesService);
    addToWatchlist(userId: string, dto: AddWatchlistDto): Promise<{
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
    getMyWatchlist(userId: string, status?: 'want_to_watch' | 'seen'): Promise<{
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
    checkTitleStatus(userId: string, titleId: string): Promise<{
        inWatchlist: boolean;
        entryId: string | null;
        status: string | null;
    }>;
    updateStatus(userId: string, entryId: string, dto: UpdateWatchlistDto): Promise<{
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
    removeFromWatchlist(userId: string, entryId: string): Promise<{
        message: string;
    }>;
    getUserWatchlist(targetUserId: string, viewerUserId: string): Promise<{
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
}
