import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { TasteQuizDto } from './dto/taste-quiz.dto.js';
import { UpdatePrivacyDto } from './dto/update-privacy.dto.js';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user full profile and counts' })
  getMyProfile(@Req() req: any) {
    return this.usersService.getMyProfile(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update display name, bio, or avatar URL' })
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Upload avatar image from device gallery/files/camera' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    }),
  )
  uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatarFile(req.user.id, avatarUrl);
  }

  @Patch('me/taste-quiz')
  @ApiOperation({ summary: 'Save onboarding favourite genres and mood tags' })
  saveTasteQuiz(@Req() req: any, @Body() dto: TasteQuizDto) {
    return this.usersService.saveTasteQuiz(req.user.id, dto);
  }

  @Patch('me/privacy')
  @ApiOperation({ summary: 'Update profile visibility and call permissions' })
  updatePrivacy(@Req() req: any, @Body() dto: UpdatePrivacyDto) {
    return this.usersService.updatePrivacy(req.user.id, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search active users by display name or email' })
  @ApiQuery({ name: 'q', required: false, example: 'Areeba' })
  searchUsers(@Query('q') q: string, @Req() req: any) {
    return this.usersService.searchUsers(q, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'View another user public profile (respects privacy)' })
  getPublicProfile(@Param('id') id: string, @Req() req: any) {
    return this.usersService.getPublicProfile(id, req.user.id);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Deactivate current user account (soft delete)' })
  deactivateAccount(@Req() req: any) {
    return this.usersService.deactivateAccount(req.user.id);
  }
}