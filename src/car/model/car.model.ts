import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Reservation {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() }) 
  _id?: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['en attente', 'réservé', 'rejeté'], default: 'en attente' })
  statut: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

@Schema()
export class Car extends Document {
  @Prop({ required: true })
  marque: string;

  @Prop({ required: true })
  modele: string;

  @Prop()
  annee: number;

  @Prop()
  couleur: string;

  @Prop()
  kilometrage: number;

  @Prop()
  price: number;

  @Prop()
  images: string[];

  @Prop({ required: true, enum: ['bon état', 'en panne'], default: 'bon état' })
  statut: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  entrepriseId: Types.ObjectId;

  @Prop({ type: [ReservationSchema], default: [] })
  reservations: Reservation[];
}

export const CarSchema = SchemaFactory.createForClass(Car);