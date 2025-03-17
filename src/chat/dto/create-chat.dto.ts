import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {

  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @IsString()
  text: string; 
 ;
}