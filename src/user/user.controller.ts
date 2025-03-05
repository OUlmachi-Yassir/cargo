import { Controller, Get, Param, Put, Delete, Body, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './model/user.model';
import { UpdateLocationDto } from './dto/locationDto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { JwtAuthGuard } from 'src/Middleware/auth/jwt-auth.guard';

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

  @Put(':id/image')
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  FileInterceptor('image', {
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only image files are allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }),
)
async updateProfileImage(
  @Request() req,
  @UploadedFile() image: Express.Multer.File, 
): Promise<User> {
  if (!image) {
    throw new Error('Aucune image téléchargée.');
  }
  return this.userService.updateProfileImage(req.user.id, [image]); 
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
