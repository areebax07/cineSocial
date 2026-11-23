import { PrismaService } from '../prisma/prisma.service.js';
import { DiscoverTitlesDto } from './dto/discover-titles.dto.js';
import { SearchTitlesDto } from './dto/search-titles.dto.js';
export declare class TitlesService {
    private prisma;
    private readonly tmdbBaseUrl;
    private readonly imageBaseUrl;
    constructor(prisma: PrismaService);
    private getApiKey;
    private fetchFromTmdb;
    private mapTmdbListItem;
    getGenres(): Promise<{
        id: number;
        name: string;
    }[]>;
    getTrending(type?: 'all' | 'movie' | 'tv', timeWindow?: 'day' | 'week', page?: number): Promise<{
        page: any;
        totalPages: any;
        totalResults: any;
        results: any;
    }>;
    discover(dto: DiscoverTitlesDto): Promise<{
        page: any;
        totalPages: any;
        totalResults: any;
        results: any;
    }>;
    search(dto: SearchTitlesDto): Promise<{
        page: any;
        totalPages: any;
        totalResults: any;
        results: any;
    }>;
    getTitleDetailsAndCache(type: 'movie' | 'tv', tmdbId: number): Promise<{
        youtubeTrailerUrl: string | null;
        backdropUrl: string | null;
        genres: any;
        cast: any;
        communityRating: {
            average: number;
            count: number;
        };
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
    }>;
    getCachedTitleById(id: string): Promise<{
        _count: {
            reviews: number;
            watchlistEntries: number;
        };
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
    }>;
}
