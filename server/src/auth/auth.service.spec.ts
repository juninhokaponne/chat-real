import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  const mockUsersService = {
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    create: jest.fn(),
    isLocked: jest.fn().mockResolvedValue(false),
    incrementFailedLogin: jest.fn().mockResolvedValue(undefined),
    resetFailedLogin: jest.fn().mockResolvedValue(undefined),
    addRefreshToken: jest.fn().mockResolvedValue(undefined),
    removeRefreshToken: jest.fn().mockResolvedValue(undefined),
    verifyRefreshToken: jest.fn().mockResolvedValue(true),
  };
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('signup', () => {
    it('should create a new user and return token', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockImplementation(async (u) => ({ ...u, _id: '1' }));

      const res = await service.signup('a@b.com', 'Password123!', 'Name');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('a@b.com');
      expect(res).toHaveProperty('access_token', 'signed-token');
    });

    it('should throw when user exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ email: 'a@b.com' });
      await expect(service.signup('a@b.com', 'pw', 'n')).rejects.toThrow();
    });
  });

  describe('signin', () => {
    it('should return token for valid credentials', async () => {
      const hashed = await bcrypt.hash('Password123!', 10);
  mockUsersService.findByEmailWithPassword.mockResolvedValue({ password: hashed, _id: '1', email: 'a@b.com' });
      const res = await service.signin('a@b.com', 'Password123!');
      expect(res).toHaveProperty('access_token', 'signed-token');
    });

    it('should throw when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(service.signin('x@x.com', 'pw')).rejects.toThrow();
    });

    it('should throw when wrong password', async () => {
  mockUsersService.findByEmailWithPassword.mockResolvedValue({ password: await bcrypt.hash('other', 10) });
      await expect(service.signin('a@b.com', 'wrong')).rejects.toThrow();
    });
  });
});
