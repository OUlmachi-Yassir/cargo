import { Controller, Get, Param, Put, Delete, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './model/user.model';
import { UpdateLocationDto } from './dto/locationDto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: Partial<User>): Promise<User> {
    return this.userService.update(id, updateData);
  }

  @Put(':id/location')
  async updateLocation(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.userService.updateLocation(id, updateLocationDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.remove(id);
  }
}
