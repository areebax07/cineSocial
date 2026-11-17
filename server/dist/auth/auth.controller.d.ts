import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getMe(req: any): any;
}
