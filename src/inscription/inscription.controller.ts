import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { InscriptionService } from './inscription.service';
import { LoginDto, RegisterDto } from './DTO/auth.dto';
import { User } from 'src/user/model/user.model';


@Controller('auth')
export class InscriptionController {
  constructor(private readonly inscriptionService: InscriptionService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() dto: RegisterDto): Promise<User> {
    return this.inscriptionService.register(dto);
  }
  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() dto: LoginDto) {
    return this.inscriptionService.login(dto);
  }
}
