import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { ListReviewsDto } from './dto/list-reviews.dto.js';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a 1-5 star review (by titleId or tmdbId + type); one per user per title',
  })
  create(@Req() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List reviews (paginated), filter by titleId and/or userId' })
  findAll(@Query() dto: ListReviewsDto, @Req() req: any) {
    return this.reviewsService.findAll(dto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single review' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.reviewsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update your own review (rating and/or body)' })
  update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete your own review' })
  remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.remove(req.user.id, id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Toggle like/unlike on a review' })
  toggleLike(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.toggleLike(req.user.id, id);
  }
}