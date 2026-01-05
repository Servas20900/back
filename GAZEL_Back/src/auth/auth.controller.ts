import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, AuthResponseDto, UpdateUserDto } from './dtos';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser('id_user') id_user: number) {
    return this.authService.getProfile(id_user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @GetUser('id_user') id_user: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateProfile(id_user, updateUserDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetUser('id_user') id_user: number,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(id_user, data.currentPassword, data.newPassword);
  }
}
