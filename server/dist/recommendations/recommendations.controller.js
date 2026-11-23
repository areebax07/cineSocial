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
import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RecommendationsService } from './recommendations.service.js';
import { RecommendationFeedbackDto } from './dto/recommendation-feedback.dto.js';
let RecommendationsController = class RecommendationsController {
    recommendationsService;
    constructor(recommendationsService) {
        this.recommendationsService = recommendationsService;
    }
    getRecommendations(req) {
        return this.recommendationsService.getPersonalizedRails(req.user.id);
    }
    submitFeedback(req, dto) {
        return this.recommendationsService.submitFeedback(req.user.id, dto);
    }
    getMyFeedback(req) {
        return this.recommendationsService.getMyFeedback(req.user.id);
    }
    removeFeedback(req, titleId) {
        return this.recommendationsService.removeFeedback(req.user.id, titleId);
    }
};
__decorate([
    Get(),
    ApiOperation({
        summary: 'Get personalized recommendation rails (taste quiz, friends, trending)',
    }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "getRecommendations", null);
__decorate([
    Post('feedback'),
    ApiOperation({
        summary: 'Upvote or dismiss a recommended title (by titleId or tmdbId + type)',
    }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RecommendationFeedbackDto]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "submitFeedback", null);
__decorate([
    Get('feedback'),
    ApiOperation({ summary: 'Get all upvoted and dismissed titles for current user' }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "getMyFeedback", null);
__decorate([
    Delete('feedback/:titleId'),
    ApiOperation({ summary: 'Undo/remove feedback on a title' }),
    __param(0, Req()),
    __param(1, Param('titleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "removeFeedback", null);
RecommendationsController = __decorate([
    ApiTags('Recommendations'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('recommendations'),
    __metadata("design:paramtypes", [RecommendationsService])
], RecommendationsController);
export { RecommendationsController };
//# sourceMappingURL=recommendations.controller.js.map