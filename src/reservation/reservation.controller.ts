import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, Req } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationDto } from './dto/reservation.dto';
import { JwtAuthGuard } from 'src/Middleware/auth/jwt-auth.guard';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReservation(@Request() req, @Body() dto: ReservationDto) {
    dto.userId = req.user.id;
    return this.reservationService.createReservation(dto,req.user.id);
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approveReservation(@Param('id') id: string) {
    return this.reservationService.approveReservation(id);
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectReservation(@Param('id') id: string) {
    return this.reservationService.rejectReservation(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllReservations() {
    return this.reservationService.getAllReservations();
  }

  @Get('user/')
  @UseGuards(JwtAuthGuard)
  async getReservationsByUser(@Req() req: any) {
    const userId = req.user.id;
    return this.reservationService.getReservationsByUser(userId);
  }
}
