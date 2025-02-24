import { Controller, Post, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationDto } from './dto/reservation.dto';
import { JwtAuthGuard } from 'src/Middleware/auth/jwt-auth.guard';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // Create a reservation request
  @Post()
  @UseGuards(JwtAuthGuard)
  async createReservation(@Request() req, @Body() dto: ReservationDto) {
    dto.userId = req.user.id;
    return this.reservationService.createReservation(dto,req.user.id);
  }

  // Approve a reservation
  @Put(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approveReservation(@Param('id') id: string) {
    return this.reservationService.approveReservation(id);
  }

  // Reject a reservation
  @Put(':id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectReservation(@Param('id') id: string) {
    return this.reservationService.rejectReservation(id);
  }

  // Get all reservations
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllReservations() {
    return this.reservationService.getAllReservations();
  }

  // Get user reservations
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getReservationsByUser(@Param('userId') userId: string) {
    return this.reservationService.getReservationsByUser(userId);
  }
}
