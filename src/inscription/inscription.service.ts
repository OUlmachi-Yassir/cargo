import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/model/user.model';
import { LoginDto, RegisterDto } from './DTO/auth.dto';

@Injectable()
export class InscriptionService {
  private validIces: string[];

  constructor(@InjectModel(User.name) private userModel: Model<User>) {

    const data = fs.readFileSync('ice.json', 'utf-8');
    this.validIces = JSON.parse(data).valid_ices;
  }

  async register(dto: RegisterDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: dto.email }).exec();
    if (existingUser) {
      throw new BadRequestException('Email déjà utilisé.');
    }

    let role = 'user';

    if (dto.ice) {
      if (!this.validIces.includes(dto.ice)) {
        throw new BadRequestException('ICE invalide ou non trouvé.');
      }
      role = 'company';
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = new this.userModel({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      ice: dto.ice,
      role,
    });

    return newUser.save();
  }

  async login(dto: LoginDto): Promise<{ token: string }> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect.');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Email ou mot de passe incorrect.');

    return this.generateToken(user);
  }

  private generateToken(user: User): { token: string } {
    const token = jwt.sign({ id: user._id, role: user.role }, 'SECRET_KEY', { expiresIn: '7d' });
    return { token };
  }
}
