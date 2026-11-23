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
import { IsIn, IsInt, IsOptional, IsUUID } from 'class-validator';
export class AddWatchlistDto {
    titleId;
    tmdbId;
    type;
    status = 'want_to_watch';
}
__decorate([
    ApiPropertyOptional({
        example: 'b3b8c9d0-1234-5678-9abc-def012345678',
        description: 'CineSocial Title UUID (provide either titleId OR tmdbId + type)',
    }),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], AddWatchlistDto.prototype, "titleId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 157336,
        description: 'TMDB numeric ID if title is not yet cached in CineSocial',
    }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    __metadata("design:type", Number)
], AddWatchlistDto.prototype, "tmdbId", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'movie',
        enum: ['movie', 'tv'],
        description: 'Required when adding via tmdbId',
    }),
    IsOptional(),
    IsIn(['movie', 'tv']),
    __metadata("design:type", String)
], AddWatchlistDto.prototype, "type", void 0);
__decorate([
    ApiPropertyOptional({
        example: 'want_to_watch',
        enum: ['want_to_watch', 'seen'],
        default: 'want_to_watch',
    }),
    IsOptional(),
    IsIn(['want_to_watch', 'seen']),
    __metadata("design:type", String)
], AddWatchlistDto.prototype, "status", void 0);
//# sourceMappingURL=add-watchlist.dto.js.map