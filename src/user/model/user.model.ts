import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, unique: true })
  ice?: string;

  @Prop({ required: true, enum: ['user', 'company'], default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
