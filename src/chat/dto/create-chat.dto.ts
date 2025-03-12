import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @IsArray()
  messages: { 
    sender: string; 
    text: string; 
    timestamp: Date;
  }[];
}