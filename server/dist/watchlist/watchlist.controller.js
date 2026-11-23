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
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { WatchlistService } from './watchlist.service.js';
import { AddWatchlistDto } from './dto/add-watchlist.dto.js';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto.js';
let WatchlistController = class WatchlistController {
    watchlistService;
    constructor(watchlistService) {
        this.watchlistService = watchlistService;
    }
    addToWatchlist(req, dto) {
        return this.watchlistService.addToWatchlist(req.user.id, dto);
    }
    getMyWatchlist(req, status) {
        if (status && status !== 'want_to_watch' && status !== 'seen') {
            throw new BadRequestException('Status must be either "want_to_watch" or "seen"');
        }
        return this.watchlistService.getMyWatchlist(req.user.id, status);
    }
    checkTitleStatus(req, titleId) {
        return this.watchlistService.checkTitleStatus(req.user.id, titleId);
    }
    getUserWatchlist(userId, req) {
        return this.watchlistService.getUserWatchlist(userId, req.user.id);
    }
    updateStatus(req, id, dto) {
        return this.watchlistService.updateStatus(req.user.id, id, dto);
    }
    removeFromWatchlist(req, id) {
        return this.watchlistService.removeFromWatchlist(req.user.id, id);
    }
};
__decorate([
    Post(),
    ApiOperation({
        summary: 'Add a movie/TV show to watchlist (by titleId or tmdbId + type)',
    }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AddWatchlistDto]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "addToWatchlist", null);
__decorate([
    Get(),
    ApiOperation({ summary: 'Get current user watchlist and counts' }),
    ApiQuery({
        name: 'status',
        required: false,
        enum: ['want_to_watch', 'seen'],
    }),
    __param(0, Req()),
    __param(1, Query('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "getMyWatchlist", null);
__decorate([
    Get('check/:titleId'),
    ApiOperation({ summary: 'Check if a specific title is in current user watchlist' }),
    __param(0, Req()),
    __param(1, Param('titleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "checkTitleStatus", null);
__decorate([
    Get('user/:userId'),
    ApiOperation({ summary: 'View another user watchlist (respects privacy)' }),
    __param(0, Param('userId')),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "getUserWatchlist", null);
__decorate([
    Patch(':id'),
    ApiOperation({ summary: 'Toggle watchlist status between want_to_watch and seen' }),
    __param(0, Req()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateWatchlistDto]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "updateStatus", null);
__decorate([
    Delete(':id'),
    ApiOperation({ summary: 'Remove an entry from watchlist' }),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WatchlistController.prototype, "removeFromWatchlist", null);
WatchlistController = __decorate([
    ApiTags('Watchlist'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('watchlist'),
    __metadata("design:paramtypes", [WatchlistService])
], WatchlistController);
export { WatchlistController };
//# sourceMappingURL=watchlist.controller.js.map