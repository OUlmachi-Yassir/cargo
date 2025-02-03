import { Test, TestingModule } from '@nestjs/testing';
import { ExempleController } from './exemple.controller';

describe('ExempleController', () => {
  let controller: ExempleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExempleController],
    }).compile();

    controller = module.get<ExempleController>(ExempleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
