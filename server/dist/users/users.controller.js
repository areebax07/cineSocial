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
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags, } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { TasteQuizDto } from './dto/taste-quiz.dto.js';
import { UpdatePrivacyDto } from './dto/update-privacy.dto.js';
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    getMyProfile(req) {
        return this.usersService.getMyProfile(req.user.id);
    }
    updateProfile(req, dto) {
        return this.usersService.updateProfile(req.user.id, dto);
    }
    uploadAvatar(req, file) {
        if (!file) {
            throw new BadRequestException('No image file uploaded');
        }
        const avatarUrl = `/uploads/avatars/${file.filename}`;
        return this.usersService.updateAvatarFile(req.user.id, avatarUrl);
    }
    saveTasteQuiz(req, dto) {
        return this.usersService.saveTasteQuiz(req.user.id, dto);
    }
    updatePrivacy(req, dto) {
        return this.usersService.updatePrivacy(req.user.id, dto);
    }
    searchUsers(q, req) {
        return this.usersService.searchUsers(q, req.user.id);
    }
    getPublicProfile(id, req) {
        return this.usersService.getPublicProfile(id, req.user.id);
    }
    deactivateAccount(req) {
        return this.usersService.deactivateAccount(req.user.id);
    }
};
__decorate([
    Get('me'),
    ApiOperation({ summary: 'Get current user full profile and counts' }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyProfile", null);
__decorate([
    Patch('me'),
    ApiOperation({ summary: 'Update display name, bio, or avatar URL' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
__decorate([
    Post('me/avatar'),
    ApiOperation({ summary: 'Upload avatar image from device gallery/files/camera' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    UseInterceptors(FileInterceptor('file', {
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
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, Req()),
    __param(1, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    Patch('me/taste-quiz'),
    ApiOperation({ summary: 'Save onboarding favourite genres and mood tags' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, TasteQuizDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "saveTasteQuiz", null);
__decorate([
    Patch('me/privacy'),
    ApiOperation({ summary: 'Update profile visibility and call permissions' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdatePrivacyDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updatePrivacy", null);
__decorate([
    Get('search'),
    ApiOperation({ summary: 'Search active users by display name or email' }),
    ApiQuery({ name: 'q', required: false, example: 'Areeba' }),
    __param(0, Query('q')),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "searchUsers", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'View another user public profile (respects privacy)' }),
    __param(0, Param('id')),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPublicProfile", null);
__decorate([
    Delete('me'),
    ApiOperation({ summary: 'Deactivate current user account (soft delete)' }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deactivateAccount", null);
UsersController = __decorate([
    ApiTags('Users'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('users'),
    __metadata("design:paramtypes", [UsersService])
], UsersController);
export { UsersController };
//# sourceMappingURL=users.controller.js.map