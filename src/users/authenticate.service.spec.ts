import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticateService } from './authenticate.service';
import { UsersService } from './users.service';

describe('AuthenticateService', () => {
  let service: AuthenticateService;
  let fakeUserService: Partial<UsersService>;
  beforeEach(async () => {
    const users = [];

    fakeUserService = {
      find: (email) =>
        Promise.resolve(users.filter((user) => user.email === email)),
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 99999), email, password };
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticateService,
        { provide: UsersService, useValue: fakeUserService },
      ],
    }).compile();

    service = module.get<AuthenticateService>(AuthenticateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('creates a new user with a salted and hashed password', async () => {
      const user = await service.signup('test@test.com', 'Test1234');
      expect(user.password).not.toEqual('Test1234');
      const [salt, hash] = user.password.split('.');
      expect(salt).toBeDefined();
      expect(hash).toBeDefined();
    });

    it('throws an error for an duplicated email', async () => {
      await service.signup('test@test.com', 'Test1234');

      await expect(service.signup('test@test.com', 'Test1234')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signin', () => {
    it('throws an error if user with email is not found', async () => {
      await expect(service.signin('test@test.com', 'Test1234')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws if an invalid password is provided', async () => {
      await service.signup('test@test.com', 'Test1234');

      await expect(
        service.signin('test@test.com', 'Test12345'),
      ).rejects.toThrow(BadRequestException);
    });

    it('return the user if correct password is provided', async () => {
      await service.signup('test@test.com', 'Test1234');
      const user = await service.signin('test@test.com', 'Test1234');
      expect(user).toBeDefined();
    });
  });
});
