import { AuthGuard } from '@nestjs/passport';
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Delete,Patch,UseInterceptors ,UploadedFile, Get} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('api/v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.OK)
    async register(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('get-profile')
    async profile(@Req() req: any) {
        return this.authService.profile(req.user);
    }



    @UseGuards(AuthGuard('jwt'))
    @Patch('update-profile')
    @UseInterceptors( FileInterceptor('avatar'))
    
    async updateProfile(
        @Req() req: any,

        @Body() body: any,

        @UploadedFile()
        file?: Express.Multer.File,
    ) {
        return this.authService.updateProfile(
            req.user.id,
            body,
            file,
        );
    }



    @UseGuards(AuthGuard('jwt'))
    @Delete('delete-account')
    async deleteAccount(
        @Req() req: any,

        @Body('password')
        password: string,
    ) {
        return this.authService.deleteAccount(
            req.user.id,
            password,
        );
    }


    @Post('forget-password')
    async forgetPassword(
        @Body('email') email: string,
    ) {
        return this.authService.forgetPassword(
            email,
        );
    }

    @Post('social-login')
    async socialLogin(@Body() body: any) {
        return this.authService.socialLogin(
            body,
        );
    }
}
