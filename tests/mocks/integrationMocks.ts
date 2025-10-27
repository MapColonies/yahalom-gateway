import { Repository } from 'typeorm';
import { Message } from '@src/DAL/entities/message';
import { fullMessageInstance } from './generalMocks';

export const mockRepository: Partial<Repository<Message>> = {
  find: jest.fn().mockResolvedValue([fullMessageInstance as unknown as Message]),
  findOne: jest.fn().mockResolvedValue(fullMessageInstance as unknown as Message),
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([fullMessageInstance as unknown as Message]),
  }),
};

export const mockConnection = { getRepository: jest.fn(() => mockRepository) };
