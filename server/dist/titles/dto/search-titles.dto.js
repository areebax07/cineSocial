var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
export class SearchTitlesDto {
    q;
    type = 'all';
    page = 1;
}
__decorate([
    ApiProperty({ example: 'Interstellar', description: 'Movie or TV show search query' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], SearchTitlesDto.prototype, "q", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['all', 'movie', 'tv'], default: 'all' }),
    IsOptional(),
    IsIn(['all', 'movie', 'tv']),
    __metadata("design:type", String)
], SearchTitlesDto.prototype, "type", void 0);
__decorate([
    ApiPropertyOptional({ default: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], SearchTitlesDto.prototype, "page", void 0);
//# sourceMappingURL=search-titles.dto.js.map