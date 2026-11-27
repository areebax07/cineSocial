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
import { CommunitiesService } from './communities.service.js';
import { CreateCommunityDto } from './dto/create-community.dto.js';
import { UpdateCommunityDto } from './dto/update-community.dto.js';
import { ListCommunitiesDto } from './dto/list-communities.dto.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

@ApiTags('Communities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  // ----- communities -----

  @Post()
  @ApiOperation({ summary: 'Create a film club (you become its owner)' })
  create(@Req() req: any, @Body() dto: CreateCommunityDto) {
    return this.communitiesService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List/search communities (paginated)' })
  findAll(@Req() req: any, @Query() dto: ListCommunitiesDto) {
    return this.communitiesService.findAll(req.user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get community details, counts and your role' })
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.communitiesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit name/description (owner only)' })
  update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommunityDto,
  ) {
    return this.communitiesService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete community with its members and posts (owner only)' })
  remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.communitiesService.remove(req.user.id, id);
  }

  // ----- membership -----

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a community (repeat calls are harmless)' })
  join(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.communitiesService.join(req.user.id, id);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a community (owner must transfer ownership or delete)' })
  leave(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.communitiesService.leave(req.user.id, id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List members with roles (paginated)' })
  members(@Param('id', ParseUUIDPipe) id: string, @Query() dto: PaginationQueryDto) {
    return this.communitiesService.getMembers(id, dto);
  }

  @Patch(':id/members/:userId/role')
  @ApiOperation({ summary: 'Set a member role, or transfer ownership (owner only)' })
  updateRole(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.communitiesService.updateMemberRole(req.user.id, id, userId, dto);
  }

  // ----- discussion posts -----

  @Post(':id/posts')
  @ApiOperation({ summary: 'Start a discussion thread (members only)' })
  createPost(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.communitiesService.createPost(req.user.id, id, dto);
  }

  @Get(':id/posts')
  @ApiOperation({ summary: 'List discussion threads, newest first (paginated)' })
  listPosts(@Param('id', ParseUUIDPipe) id: string, @Query() dto: PaginationQueryDto) {
    return this.communitiesService.listPosts(id, dto);
  }

  @Get(':id/posts/:postId')
  @ApiOperation({ summary: 'Get a single discussion thread' })
  getPost(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.communitiesService.getOnePost(id, postId);
  }

  @Patch(':id/posts/:postId')
  @ApiOperation({ summary: 'Edit your own post' })
  updatePost(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.communitiesService.updatePost(req.user.id, id, postId, dto);
  }

  @Delete(':id/posts/:postId')
  @ApiOperation({ summary: 'Delete a post (author, moderator or owner)' })
  removePost(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.communitiesService.removePost(req.user.id, id, postId);
  }
}