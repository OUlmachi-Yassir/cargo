import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, UnauthorizedException, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CarService } from './car.service';
import { JwtAuthGuard } from 'src/Middleware/auth/jwt-auth.guard';
import { CarDto } from './DTO/car.dto';
import { Car } from './model/car.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';


@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.originalname.replace(/\s/g, '_')}-${uniqueSuffix}`);
        },
      }),
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
   
  async createCar(
    @Request() req,
    @Body() dto: CarDto,
    @UploadedFiles() images: Express.Multer.File[]
  ): Promise<Car> {
    console.log('DTO:', dto); 
    console.log('Images:', images); 
  
    if (req.user.role !== 'company') {
      throw new UnauthorizedException('Seules les entreprises peuvent ajouter des voitures.');
    }
    return this.carService.createCar(dto, req.user.id, images);
  }

  @Get()
  async getAllCars(): Promise<Car[]> {
    return this.carService.getAllCars();
  }

  @Get(':id')
  async getCarById(@Param('id') id: string): Promise<Car> {
    return this.carService.getCarById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCar(@Request() req, @Param('id') id: string, @Body() dto: CarDto): Promise<Car> {
    return this.carService.updateCar(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCar(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
    await this.carService.deleteCar(id);
    return { message: 'Voiture supprimée.' };
  }
}
