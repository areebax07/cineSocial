import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SocialService } from './social.service.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { SearchUsersDto } from './dto/search-users.dto.js';
import { FeedQueryDto } from './dto/feed-query.dto.js';

@ApiTags('Social')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('follow/:userId')
  @ApiOperation({ summary: 'Follow a user (repeat calls are harmless; self-follow returns 400)' })
  follow(@Req() req: any, @Param('userId', ParseUUIDPipe) userId: string) {
    return this.socialService.follow(req.user.id, userId);
  }

  @Delete('follow/:userId')
  @ApiOperation({ summary: 'Unfollow a user (idempotent)' })
  unfollow(@Req() req: any, @Param('userId', ParseUUIDPipe) userId: string) {
    return this.socialService.unfollow(req.user.id, userId);
  }

  @Get('users/search')
  @ApiOperation({ summary: 'Search active users by display name' })
  search(@Req() req: any, @Query() dto: SearchUsersDto) {
    return this.socialService.searchUsers(req.user.id, dto);
  }

  @Get('users/:userId/followers')
  @ApiOperation({ summary: 'Paginated followers of a user' })
  followers(
    @Req() req: any,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.socialService.getFollowers(userId, req.user.id, dto);
  }

  @Get('users/:userId/following')
  @ApiOperation({ summary: 'Paginated list of users a user follows' })
  following(
    @Req() req: any,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() dto: PaginationQueryDto,
  ) {
    return this.socialService.getFollowing(userId, req.user.id, dto);
  }

  @Get('feed')
  @ApiOperation({
    summary: "Friends' recent reviews and watchlist activity, newest first (cursor pagination)",
  })
  feed(@Req() req: any, @Query() dto: FeedQueryDto) {
    return this.socialService.getFeed(req.user.id, dto);
  }
}