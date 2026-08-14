import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { DaytonaSandboxService } from 'src/ai-agent/daytona-sandbox.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findById: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let projectRepository: { find: jest.Mock };
  let daytonaSandboxService: { deleteSandbox: jest.Mock };
  let user: User;

  beforeEach(async () => {
    user = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password: '$2b$10$hashed',
      theme: null,
    } as User;

    usersService = {
      findById: jest.fn().mockResolvedValue(user),
      save: jest.fn().mockImplementation((u) => Promise.resolve(u)),
      remove: jest.fn().mockResolvedValue(user),
    };
    projectRepository = {
      find: jest
        .fn()
        .mockResolvedValue([{ id: 'project-1', sandboxId: 'sb-1' } as Project]),
    };
    daytonaSandboxService = {
      deleteSandbox: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
          },
        },
        { provide: getRepositoryToken(Project), useValue: projectRepository },
        { provide: DaytonaSandboxService, useValue: daytonaSandboxService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('returns email, name and theme', async () => {
      await expect(service.getUser('user-1')).resolves.toEqual({
        email: 'john@example.com',
        name: 'John Doe',
        theme: null,
      });
    });

    it('throws when user is not found', async () => {
      usersService.findById.mockResolvedValue(null);
      await expect(service.getUser('missing')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('updateProfile', () => {
    it('updates name and theme', async () => {
      const result = await service.updateProfile('user-1', {
        name: 'Jane Doe',
        theme: 'dark',
      });

      expect(usersService.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane Doe', theme: 'dark' }),
      );
      expect(result).toEqual({
        email: 'john@example.com',
        name: 'Jane Doe',
        theme: 'dark',
      });
    });

    it('keeps values untouched when not provided', async () => {
      const result = await service.updateProfile('user-1', {});

      expect(result).toEqual({
        email: 'john@example.com',
        name: 'John Doe',
        theme: null,
      });
    });
  });

  describe('changePassword', () => {
    it('updates the password when current password matches', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);
      const hashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValueOnce('new-hash' as never);

      const result = await service.changePassword(
        'user-1',
        'old-pass',
        'new-pass-123',
      );

      expect(hashSpy).toHaveBeenCalledWith('new-pass-123', 10);
      expect(usersService.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'new-hash' }),
      );
      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('throws when current password is incorrect', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

      await expect(
        service.changePassword('user-1', 'wrong', 'new-pass-123'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(usersService.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('deletes sandboxes and removes the user', async () => {
      const result = await service.deleteAccount('user-1');

      expect(projectRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' } },
      });
      expect(daytonaSandboxService.deleteSandbox).toHaveBeenCalledWith(
        'project-1',
      );
      expect(usersService.remove).toHaveBeenCalledWith(user);
      expect(result).toEqual({ message: 'Account deleted successfully' });
    });
  });
});
