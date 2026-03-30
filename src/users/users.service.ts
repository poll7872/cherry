import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>) {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async save(user: User) {
    return this.userRepository.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByResetToken(token: string) {
    return this.userRepository.findOne({
      where: { resetToken: token, resetTokenExpires: MoreThan(new Date()) },
    });
  }

  async findWithEmailVerification(token: string) {
    return this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });
  }
}
