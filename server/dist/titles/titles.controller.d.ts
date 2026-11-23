import { TitlesService } from './titles.service.js';
import { DiscoverTitlesDto } from './dto/discover-titles.dto.js';
import { SearchTitlesDto } from './dto/search-titles.dto.js';
export declare class TitlesController {
    private readonly titlesService;
    constructor(titlesService: TitlesService);
    getGenres(): Promise<{
        id: number;
        name: string;
    }[]>;
    getTrending(type?: 'all' | 'movie' | 'tv', window?: 'day' | 'week', page?: string): Promise<{
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
    getCachedById(id: string): Promise<{
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
    getTitleDetails(type: string, tmdbId: number): Promise<{
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
}
