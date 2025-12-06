import { jest } from '@jest/globals';

export const prisma = {
    category: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
    },
    sound: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
    },
};
