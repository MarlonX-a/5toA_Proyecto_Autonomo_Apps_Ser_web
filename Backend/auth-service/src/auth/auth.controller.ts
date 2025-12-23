import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body) {
    return this.authService.register(
      body.username,
      body.password,
      body.email,
      body.firstName,
      body.lastName,
      body.role,
      body.telefono,
      body.descripcion,
      body.ubicacion,
    );
  }

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    return this.authService.login(user);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@Req() req) {
    return this.authService.logout(req.user);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') token: string) {
    return this.authService.refresh(token);
  }
}
