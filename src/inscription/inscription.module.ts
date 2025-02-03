import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InscriptionService } from './inscription.service';
import { InscriptionController } from './inscription.controller';
import { User, UserSchema } from 'src/user/model/user.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [InscriptionController],
  providers: [InscriptionService],
})
export class InscriptionModule {}
