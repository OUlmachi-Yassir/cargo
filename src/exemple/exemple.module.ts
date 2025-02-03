import { Module } from '@nestjs/common';
import { ExempleController } from './exemple.controller';
import { ExempleService } from './exemple.service';

@Module({
  controllers: [ExempleController],
  providers: [ExempleService]
})
export class ExempleModule {}
