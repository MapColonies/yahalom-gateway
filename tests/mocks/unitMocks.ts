import { SelectQueryBuilder, Repository } from 'typeorm';
import { Message } from '@src/DAL/entities/message';
import { ConnectionManager } from '@src/DAL/connectionManager';

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
export const mockFindOne = jest.fn<Promise<Message | null>, [object?]>();
export const mockCreate: Repository<Message>['create'] = ((entityLike?: Partial<Message> | Partial<Message>[]) => {
  if (Array.isArray(entityLike)) {
    return entityLike.map((e) => ({ ...e }) as Message);
  }
  return { ...(entityLike ?? {}) } as Message;
}) as Repository<Message>['create'];
export const mockSave = jest.fn();
export const mockDelete = jest.fn();

export const mockRepository: Partial<Repository<Message>> = {
  find: mockFind,
  findOne: mockFindOne,
  create: mockCreate,
  save: mockSave,
  delete: mockDelete,
  createQueryBuilder: jest.fn(() => mockQueryBuilder as unknown as SelectQueryBuilder<Message>),
};

export const mockConnection = {
  getRepository: jest.fn(() => mockRepository),
  init: jest.fn(),
  healthCheck: jest.fn(),
  getConnection: jest.fn(() => ({
    getRepository: jest.fn(() => mockRepository),
  })),
};

export const mockConnectionManager = {
  getConnection: jest.fn(() => mockConnection),
} as unknown as ConnectionManager;
