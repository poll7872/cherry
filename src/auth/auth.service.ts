import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from 'src/email/email.service';
import { link } from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(email: string, password: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await this.usersService.create({
      email,
      password: hashed,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 60), //1H
    });

    const link = `http://localhost:3000/verify-email?token=${verificationToken}`;
    await this.emailService.sendVerificationEmail(user.email, link);

    return {
      message: 'User created. Please verify your email',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findWithEmailVerification(token);
    if (!user) {
      throw new BadRequestException('Invalid token or expired token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await this.usersService.save(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please, verify your email');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return {
        message: 'If the email exists, a reset link was sent',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 1000 * 60 * 15); //15min

    await this.usersService.save(user);

    //Aqui luego enviaremos un email con Resend
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    await this.emailService.sendPasswordResetEmail(user.email, resetLink);
    return {
      message: 'If the email exists, a reset link was sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.resetToken = null;
    user.resetTokenExpires = null;

    await this.usersService.save(user);
    return {
      message: 'Password updated successfully',
    };
  }
}
