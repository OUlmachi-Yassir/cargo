import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Car extends Document {
  @Prop()
  marque: string;

  @Prop()
  modele: string;

  @Prop()
  images: string[]; 

  @Prop({ required: true, enum: ['non réservé', 'réservé', 'en panne'], default: 'non réservé' })
  statut: string;

  @Prop({ required: true })
  entrepriseId: string; 
}

export const CarSchema = SchemaFactory.createForClass(Car);
