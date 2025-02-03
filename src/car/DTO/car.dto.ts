import { IsNotEmpty, IsEnum, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class CarDto {
  @IsNotEmpty()
  marque: string;

  @IsNotEmpty()
  modele: string;

  @IsArray()
  @ArrayMinSize(1)
  images: string[]; 

  @IsEnum(['non réservé', 'réservé', 'en panne'])
  @IsOptional()
  statut?: string;
}
