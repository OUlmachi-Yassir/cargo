import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })  
class Location {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: false })
  city?: string; 

  @Prop({ required: false })
  country?: string; 
}
export const LocationSchema = SchemaFactory.createForClass(Location);


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

  @Prop({ required: false, type: LocationSchema })
  location?: Location;

}

export const UserSchema = SchemaFactory.createForClass(User);
