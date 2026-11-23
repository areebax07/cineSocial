var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let TitlesService = class TitlesService {
    prisma;
    tmdbBaseUrl = 'https://api.themoviedb.org/3';
    imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    constructor(prisma) {
        this.prisma = prisma;
    }
    getApiKey() {
        const key = process.env.TMDB_API_KEY;
        if (!key || key === 'PASTE_YOUR_32_CHAR_TMDB_V3_API_KEY_HERE') {
            throw new InternalServerErrorException('TMDB_API_KEY is missing in server/.env');
        }
        return key;
    }
    async fetchFromTmdb(path, params = {}) {
        const url = new URL(`${this.tmdbBaseUrl}${path}`);
        url.searchParams.set('api_key', this.getApiKey());
        url.searchParams.set('language', 'en-US');
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && v !== '') {
                url.searchParams.set(k, String(v));
            }
        }
        const response = await fetch(url.toString());
        if (!response.ok) {
            if (response.status === 404) {
                throw new NotFoundException('Title not found on TMDB');
            }
            throw new BadRequestException(`TMDB API error (${response.status}): ${response.statusText}`);
        }
        return response.json();
    }
    mapTmdbListItem(item, fallbackType) {
        const mediaType = item.media_type === 'tv' || fallbackType === 'tv' ? 'tv' : 'movie';
        const rawDate = item.release_date || item.first_air_date || '';
        const releaseYear = rawDate ? parseInt(rawDate.slice(0, 4), 10) : null;
        return {
            tmdbId: item.id,
            type: mediaType,
            name: item.title || item.name || 'Untitled',
            synopsis: item.overview || '',
            releaseYear: Number.isNaN(releaseYear) ? null : releaseYear,
            posterUrl: item.poster_path
                ? `${this.imageBaseUrl}${item.poster_path}`
                : null,
            backdropUrl: item.backdrop_path
                ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
                : null,
            tmdbRating: item.vote_average ?? 0,
            genreIds: item.genre_ids || [],
        };
    }
    async getGenres() {
        const existingCount = await this.prisma.genre.count();
        if (existingCount > 0) {
            return this.prisma.genre.findMany({ orderBy: { name: 'asc' } });
        }
        const [movieGenres, tvGenres] = await Promise.all([
            this.fetchFromTmdb('/genre/movie/list'),
            this.fetchFromTmdb('/genre/tv/list'),
        ]);
        const combined = [...(movieGenres.genres || []), ...(tvGenres.genres || [])];
        for (const g of combined) {
            await this.prisma.genre.upsert({
                where: { id: g.id },
                update: { name: g.name },
                create: { id: g.id, name: g.name },
            });
        }
        return this.prisma.genre.findMany({ orderBy: { name: 'asc' } });
    }
    async getTrending(type = 'all', timeWindow = 'week', page = 1) {
        const data = await this.fetchFromTmdb(`/trending/${type}/${timeWindow}`, {
            page,
        });
        const results = (data.results || [])
            .filter((item) => item.media_type !== 'person')
            .map((item) => this.mapTmdbListItem(item, type === 'all' ? undefined : type));
        return {
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results,
            results,
        };
    }
    async discover(dto) {
        const mediaType = dto.type || 'movie';
        const params = {
            page: dto.page || 1,
            sort_by: dto.sortBy || 'popularity.desc',
            with_genres: dto.genreId,
            'vote_average.gte': dto.minRating,
            'vote_count.gte': dto.minRating ? 50 : undefined,
        };
        if (dto.year) {
            if (mediaType === 'movie') {
                params.primary_release_year = dto.year;
            }
            else {
                params.first_air_date_year = dto.year;
            }
        }
        const data = await this.fetchFromTmdb(`/discover/${mediaType}`, params);
        return {
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results,
            results: (data.results || []).map((item) => this.mapTmdbListItem(item, mediaType)),
        };
    }
    async search(dto) {
        const searchType = dto.type || 'all';
        const endpoint = searchType === 'all' ? '/search/multi' : `/search/${searchType}`;
        const data = await this.fetchFromTmdb(endpoint, {
            query: dto.q,
            page: dto.page || 1,
            include_adult: 'false',
        });
        const results = (data.results || [])
            .filter((item) => item.media_type !== 'person')
            .map((item) => this.mapTmdbListItem(item, searchType === 'all' ? undefined : searchType));
        return {
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results,
            results,
        };
    }
    async getTitleDetailsAndCache(type, tmdbId) {
        await this.getGenres();
        const details = await this.fetchFromTmdb(`/${type}/${tmdbId}`, {
            append_to_response: 'videos,credits',
        });
        const videos = details.videos?.results || [];
        const trailer = videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official === true) ||
            videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
            videos.find((v) => v.site === 'YouTube');
        const rawDate = details.release_date || details.first_air_date || '';
        const releaseYear = rawDate ? parseInt(rawDate.slice(0, 4), 10) : null;
        const runtime = type === 'movie'
            ? details.runtime ?? null
            : details.episode_run_time?.[0] ?? null;
        const posterUrl = details.poster_path
            ? `${this.imageBaseUrl}${details.poster_path}`
            : null;
        const savedTitle = await this.prisma.title.upsert({
            where: { tmdbId },
            update: {
                type,
                name: details.title || details.name || 'Untitled',
                synopsis: details.overview || '',
                releaseYear: Number.isNaN(releaseYear) ? null : releaseYear,
                runtime,
                posterUrl,
                trailerKey: trailer?.key ?? null,
                tmdbRating: details.vote_average ?? 0,
            },
            create: {
                tmdbId,
                type,
                name: details.title || details.name || 'Untitled',
                synopsis: details.overview || '',
                releaseYear: Number.isNaN(releaseYear) ? null : releaseYear,
                runtime,
                posterUrl,
                trailerKey: trailer?.key ?? null,
                tmdbRating: details.vote_average ?? 0,
            },
        });
        const tmdbGenres = details.genres || [];
        for (const g of tmdbGenres) {
            await this.prisma.genre.upsert({
                where: { id: g.id },
                update: { name: g.name },
                create: { id: g.id, name: g.name },
            });
            await this.prisma.titleGenre.upsert({
                where: {
                    titleId_genreId: { titleId: savedTitle.id, genreId: g.id },
                },
                update: {},
                create: { titleId: savedTitle.id, genreId: g.id },
            });
        }
        const reviewStats = await this.prisma.review.aggregate({
            where: { titleId: savedTitle.id },
            _avg: { rating: true },
            _count: { rating: true },
        });
        const topCast = (details.credits?.cast || []).slice(0, 10).map((c) => ({
            id: c.id,
            name: c.name,
            character: c.character,
            profileUrl: c.profile_path
                ? `${this.imageBaseUrl}${c.profile_path}`
                : null,
        }));
        return {
            ...savedTitle,
            youtubeTrailerUrl: savedTitle.trailerKey
                ? `https://www.youtube.com/watch?v=${savedTitle.trailerKey}`
                : null,
            backdropUrl: details.backdrop_path
                ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
                : null,
            genres: tmdbGenres,
            cast: topCast,
            communityRating: {
                average: reviewStats._avg.rating ?? 0,
                count: reviewStats._count.rating,
            },
        };
    }
    async getCachedTitleById(id) {
        const title = await this.prisma.title.findUnique({
            where: { id },
            include: {
                genres: { include: { genre: true } },
                _count: { select: { reviews: true, watchlistEntries: true } },
            },
        });
        if (!title) {
            throw new NotFoundException('Cached title not found');
        }
        return title;
    }
};
TitlesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], TitlesService);
export { TitlesService };
//# sourceMappingURL=titles.service.js.map