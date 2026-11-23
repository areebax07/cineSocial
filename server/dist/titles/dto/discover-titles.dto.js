var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
export class DiscoverTitlesDto {
    type = 'movie';
    genreId;
    year;
    minRating;
    sortBy = 'popularity.desc';
    page = 1;
}
__decorate([
    ApiPropertyOptional({ enum: ['movie', 'tv'], default: 'movie' }),
    IsOptional(),
    IsIn(['movie', 'tv']),
    __metadata("design:type", String)
], DiscoverTitlesDto.prototype, "type", void 0);
__decorate([
    ApiPropertyOptional({ example: '28', description: 'TMDB Genre ID (e.g., 28 for Action, 878 for Sci-Fi)' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], DiscoverTitlesDto.prototype, "genreId", void 0);
__decorate([
    ApiPropertyOptional({ example: 2024, description: 'Release or first-air year' }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    __metadata("design:type", Number)
], DiscoverTitlesDto.prototype, "year", void 0);
__decorate([
    ApiPropertyOptional({ example: 7.5, description: 'Minimum TMDB rating (0 to 10)' }),
    IsOptional(),
    Type(() => Number),
    IsNumber(),
    Min(0),
    Max(10),
    __metadata("design:type", Number)
], DiscoverTitlesDto.prototype, "minRating", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'popularity.desc',
        enum: ['popularity.desc', 'vote_average.desc', 'primary_release_date.desc'],
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], DiscoverTitlesDto.prototype, "sortBy", void 0);
__decorate([
    ApiPropertyOptional({ default: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], DiscoverTitlesDto.prototype, "page", void 0);
//# sourceMappingURL=discover-titles.dto.js.map