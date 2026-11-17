import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            email: string;
            displayName: string;
            id: string;
            bio: string | null;
            avatarUrl: string | null;
            favouriteGenres: string[];
            moodTags: string[];
            profileVisibility: string;
            whoCanCall: string;
            status: string;
            createdAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            email: string;
            displayName: string;
            id: string;
            bio: string | null;
            avatarUrl: string | null;
            favouriteGenres: string[];
            moodTags: string[];
            profileVisibility: string;
            whoCanCall: string;
            status: string;
            createdAt: Date;
        };
    }>;
    private signToken;
}
