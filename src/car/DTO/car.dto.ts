export class CarDto {
  marque: string;
  modele: string;
  annee: number;
  couleur: string;
  kilometrage: number;
  images: string[];
  statut: string;
  entrepriseId: string;
}

export class ReservationDto {
  userId: string;
  startDate: Date;
  endDate: Date;
  statut?: string; 
}