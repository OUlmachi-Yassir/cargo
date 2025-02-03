import { Test, TestingModule } from '@nestjs/testing';
import { ExempleService } from './exemple.service';

describe('ExempleService', () => {
  let service: ExempleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExempleService],
    }).compile();

    service = module.get<ExempleService>(ExempleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
