import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
    user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

describe('UserService', () => {
    let service: UserService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a user', async () => {
            const createUserDto = { name: 'Test User' };
            const result = { id: '1', ...createUserDto, createdAt: new Date(), updatedAt: new Date() };

            (prisma.user.create as jest.Mock).mockResolvedValue(result);

            expect(await service.create(createUserDto)).toBe(result);
            expect(prisma.user.create).toHaveBeenCalledWith({ data: createUserDto });
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const result = [{ id: '1', name: 'Test User', createdAt: new Date(), updatedAt: new Date() }];

            (prisma.user.findMany as jest.Mock).mockResolvedValue(result);

            expect(await service.findAll()).toBe(result);
            expect(prisma.user.findMany).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a single user', async () => {
            const result = { id: '1', name: 'Test User', createdAt: new Date(), updatedAt: new Date() };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(result);

            expect(await service.findOne('1')).toBe(result);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const updateUserDto = { name: 'Updated User' };
            const result = { id: '1', ...updateUserDto, createdAt: new Date(), updatedAt: new Date() };

            (prisma.user.update as jest.Mock).mockResolvedValue(result);

            expect(await service.update('1', updateUserDto)).toBe(result);
            expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: '1' }, data: updateUserDto });
        });
    });

    describe('remove', () => {
        it('should remove a user', async () => {
            const result = { id: '1', name: 'Test User', createdAt: new Date(), updatedAt: new Date() };

            (prisma.user.delete as jest.Mock).mockResolvedValue(result);

            expect(await service.remove('1')).toBe(result);
            expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
        });
    });
});
