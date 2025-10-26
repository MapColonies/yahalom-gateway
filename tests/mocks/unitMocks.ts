import { SelectQueryBuilder, Repository } from 'typeorm';
import { Message } from '@src/DAL/entities/message';

interface MockQueryBuilder {
  andWhere: jest.Mock<MockQueryBuilder, [string, Record<string, unknown>?]>;
  getMany: jest.Mock<Promise<Message[]>, []>;
}

/* eslint-disable */
export const mockAndWhere = jest.fn<MockQueryBuilder, [string, Record<string, unknown>?]>().mockReturnThis();
export const mockGetMany = jest.fn<Promise<Message[]>, []>();
/* eslint-enable */

const mockQueryBuilder: MockQueryBuilder = {
  andWhere: mockAndWhere,
  getMany: mockGetMany,
};

export const mockFind = jest.fn<Promise<Message[]>, []>();

export const mockRepository: Partial<Repository<Message>> = {
  find: mockFind,
  createQueryBuilder: jest.fn(() => mockQueryBuilder as unknown as SelectQueryBuilder<Message>),
};

export const mockConnection = {
  getRepository: jest.fn(() => mockRepository),
  initializeConnection: jest.fn(),
  healthCheck: jest.fn(),
  getConnection: jest.fn(() => ({
    getRepository: jest.fn(() => mockRepository),
  })),
};
