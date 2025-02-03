import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ExempleService } from './exemple.service';
import { Request, Response } from 'express';

@Controller('session')
export class ExempleController {
  constructor(private readonly exempleService: ExempleService) {}

  @Post('start')
  startSession(@Req() req: Request, @Res() res: Response) {
    this.exempleService.startSession(req, res); 
    return res.send('Server started');
  }

  @Get('check')
  checkSession(@Req() req: Request) {
    const status = this.exempleService.checkSessionStatus(req); 
    return status; 
  }
}
