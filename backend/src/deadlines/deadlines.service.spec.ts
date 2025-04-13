import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeadlinesService } from './deadlines.service';
import { Deadline, DeadlineVisibility } from './entities/deadline.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('DeadlinesService', () => {
  let service: DeadlinesService;
  let deadlinesRepository: Repository<Deadline>;
  let mockQueryBuilder: any;

  const mockUser = {
    id: 'user-id-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: UserRole.USER,
    department: 'Construction Navale',
  };

  const mockAdmin = {
    id: 'admin-id-1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    department: 'IT',
  };

  beforeEach(async () => {
    // Mock du QueryBuilder avec toutes ses méthodes chaînées
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      getQuery: jest.fn().mockReturnValue('MOCKED_QUERY'),
      getMany: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeadlinesService,
        {
          provide: getRepositoryToken(Deadline),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            manager: {
              getRepository: jest.fn().mockReturnValue({
                findOne: jest.fn(),
                createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DeadlinesService>(DeadlinesService);
    deadlinesRepository = module.get<Repository<Deadline>>(getRepositoryToken(Deadline));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAccessibleDeadlines', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-user';
      jest.spyOn(deadlinesRepository.manager.getRepository(User), 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getAccessibleDeadlines(userId)).rejects.toThrow(NotFoundException);
    });

    it('should return all deadlines for admin users', async () => {
      // Arrange
      const mockDeadlines = [{ id: 'deadline-1' }, { id: 'deadline-2' }];
      jest.spyOn(deadlinesRepository.manager.getRepository(User), 'findOne').mockResolvedValue(mockAdmin as any);
      jest.spyOn(deadlinesRepository, 'find').mockResolvedValue(mockDeadlines as any);

      // Act
      const result = await service.getAccessibleDeadlines(mockAdmin.id);

      // Assert
      expect(result).toEqual(mockDeadlines);
      expect(deadlinesRepository.find).toHaveBeenCalledWith({
        relations: ['creator', 'project', 'comments', 'attachments'],
      });
    });

    it('should build complex query for regular users', async () => {
      // Arrange
      const mockDeadlines = [{ id: 'deadline-1' }, { id: 'deadline-2' }];
      jest.spyOn(deadlinesRepository.manager.getRepository(User), 'findOne').mockResolvedValue(mockUser as any);
      mockQueryBuilder.getMany.mockResolvedValue(mockDeadlines);

      // Act
      const result = await service.getAccessibleDeadlines(mockUser.id);

      // Assert
      expect(result).toEqual(mockDeadlines);
      expect(mockQueryBuilder.orWhere).toHaveBeenCalledTimes(5); // 5 orWhere calls in our implementation
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(3); // 3 joins in our implementation
    });
  });
});