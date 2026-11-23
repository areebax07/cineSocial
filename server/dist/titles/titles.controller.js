var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, Controller, Get, Param, ParseIntPipe, Query, } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TitlesService } from './titles.service.js';
import { DiscoverTitlesDto } from './dto/discover-titles.dto.js';
import { SearchTitlesDto } from './dto/search-titles.dto.js';
let TitlesController = class TitlesController {
    titlesService;
    constructor(titlesService) {
        this.titlesService = titlesService;
    }
    getGenres() {
        return this.titlesService.getGenres();
    }
    getTrending(type = 'all', window = 'week', page = '1') {
        return this.titlesService.getTrending(type, window, Number(page) || 1);
    }
    discover(dto) {
        return this.titlesService.discover(dto);
    }
    search(dto) {
        return this.titlesService.search(dto);
    }
    getCachedById(id) {
        return this.titlesService.getCachedTitleById(id);
    }
    getTitleDetails(type, tmdbId) {
        if (type !== 'movie' && type !== 'tv') {
            throw new BadRequestException('Type must be either "movie" or "tv"');
        }
        return this.titlesService.getTitleDetailsAndCache(type, tmdbId);
    }
};
__decorate([
    Get('genres'),
    ApiOperation({ summary: 'Get all movie and TV genres (synced with TMDB)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TitlesController.prototype, "getGenres", null);
__decorate([
    Get('trending'),
    ApiOperation({ summary: 'Get trending movies and TV shows from TMDB' }),
    ApiQuery({ name: 'type', required: false, enum: ['all', 'movie', 'tv'] }),
    ApiQuery({ name: 'window', required: false, enum: ['day', 'week'] }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    __param(0, Query('type')),
    __param(1, Query('window')),
    __param(2, Query('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TitlesController.prototype, "getTrending", null);
__decorate([
    Get('discover'),
    ApiOperation({ summary: 'Discover movies or TV shows with genre, year & rating filters' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DiscoverTitlesDto]),
    __metadata("design:returntype", void 0)
], TitlesController.prototype, "discover", null);
__decorate([
    Get('search'),
    ApiOperation({ summary: 'Search movies and TV shows by title' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SearchTitlesDto]),
    __metadata("design:returntype", void 0)
], TitlesController.prototype, "search", null);
__decorate([
    Get('cached/:id'),
    ApiOperation({ summary: 'Get a title already cached in Supabase by CineSocial UUID' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TitlesController.prototype, "getCachedById", null);
__decorate([
    Get(':type/:tmdbId'),
    ApiOperation({
        summary: 'Get full title details, YouTube trailer & cast (and cache in Supabase)',
    }),
    ApiParam({ name: 'type', enum: ['movie', 'tv'] }),
    ApiParam({ name: 'tmdbId', example: 157336, description: 'TMDB numeric ID (e.g., 157336 = Interstellar)' }),
    __param(0, Param('type')),
    __param(1, Param('tmdbId', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], TitlesController.prototype, "getTitleDetails", null);
TitlesController = __decorate([
    ApiTags('Titles & TMDB'),
    Controller('titles'),
    __metadata("design:paramtypes", [TitlesService])
], TitlesController);
export { TitlesController };
//# sourceMappingURL=titles.controller.js.map