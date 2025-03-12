import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Conversation extends Document {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  receiverId: string;

  @Prop({ type: [{ sender: String, text: String, timestamp: Date }] })
  messages: { sender: string; text: string; timestamp: Date }[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);