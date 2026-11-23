import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RecommendationsService } from './recommendations.service.js';
import { RecommendationFeedbackDto } from './dto/recommendation-feedback.dto.js';

@ApiTags('Recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get personalized recommendation rails (taste quiz, friends, trending)',
  })
  getRecommendations(@Req() req: any) {
    return this.recommendationsService.getPersonalizedRails(req.user.id);
  }

  @Post('feedback')
  @ApiOperation({
    summary: 'Upvote or dismiss a recommended title (by titleId or tmdbId + type)',
  })
  submitFeedback(@Req() req: any, @Body() dto: RecommendationFeedbackDto) {
    return this.recommendationsService.submitFeedback(req.user.id, dto);
  }

  @Get('feedback')
  @ApiOperation({ summary: 'Get all upvoted and dismissed titles for current user' })
  getMyFeedback(@Req() req: any) {
    return this.recommendationsService.getMyFeedback(req.user.id);
  }

  @Delete('feedback/:titleId')
  @ApiOperation({ summary: 'Undo/remove feedback on a title' })
  removeFeedback(@Req() req: any, @Param('titleId') titleId: string) {
    return this.recommendationsService.removeFeedback(req.user.id, titleId);
  }
}