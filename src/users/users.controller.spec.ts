import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticateService } from './authenticate.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: Partial<UsersService>;
  let mockAuthService: Partial<AuthenticateService>;

  beforeEach(async () => {
    mockUsersService = {
      findOne: (id: number) =>
        Promise.resolve({ id, email: 'test@test.com', password: 'Test1234' }),
      find: (email: string) =>
        Promise.resolve([{ id: 1, email, password: 'Test1234' }]),
    };
    mockAuthService = {
      signin: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuthenticateService, useValue: mockAuthService },
      ],
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllUsers', () => {
    it('should return a list of all users with the given email', async () => {
      const users = await controller.findAllUsers('test@test.com');
      expect(users).toHaveLength(1);
      expect(users[0].email).toEqual('test@test.com');
    });
  });

  describe('findUser', () => {
    it('should return a user with the given id', async () => {
      const user = await controller.findUser('1');
      expect(user.id).toEqual(1);
    });

    it('should throw an error if user with the id is not found', async () => {
      mockUsersService.findOne = () => null;

      await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('signIn', () => {
    it('should update session and return user', async () => {
      const session = { userId: undefined };
      const user = await controller.signin(
        {
          email: 'test@test.com',
          password: 'Test1234',
        },
        session,
      );

      expect(user.id).toEqual(1);
      expect(session.userId).toBeDefined();
    });
  });
});
