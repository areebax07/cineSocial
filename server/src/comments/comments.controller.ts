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
import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { ListCommentsDto } from './dto/list-comments.dto.js';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Comment on a review, or reply to a comment via parentCommentId',
  })
  create(@Req() req: any, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List a review\'s comments (paginated top-level, with nested replies)',
  })
  findAll(@Query() dto: ListCommentsDto) {
    return this.commentsService.findAll(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit your own comment' })
  update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete your own comment (its replies are deleted too)' })
  remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.remove(req.user.id, id);
  }
}