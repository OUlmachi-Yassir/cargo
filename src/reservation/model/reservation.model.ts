import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Reservation extends Document {
  @Prop({ required: true })
  carId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ enum: ['en attente', 'approuvée', 'rejetée'], default: 'en attente' })
  statut: string;

  @Prop({ required: true })
  startDate: Date;  

  @Prop({ required: true })
  endDate: Date;    
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
