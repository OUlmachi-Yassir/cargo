import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './model/user.model';
import { UpdateLocationDto } from './dto/locationDto';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>,
  private readonly minioService: MinioService,
) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async updateProfileImage(id: string, images: Express.Multer.File[]): Promise<User> {
    const user = await this.userModel.findById(id);
    console.log(user);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const imagesArray = Array.isArray(images) ? images : [images];
    const imageUrls = await Promise.all(imagesArray.map((file) => this.minioService.uploadFile(file)));

    user.images = imageUrls.flat();

    return user.save();
  }

  async updateLocation(id: string, updateLocationDto: UpdateLocationDto): Promise<User|null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { location: updateLocationDto },
      { new: true },
    );
  }

  async remove(id: string): Promise<{ message: string }> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
