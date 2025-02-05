/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';

interface JwtPayload {
  username: string;
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
  ) {}

  async validateUserByEmail(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.authRepository.findUserByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }

    return null;
  }

  async validateUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.authRepository.findUserById(id);

    if (user) {
      const { password: _, ...result } = user;
      return result;
    }

    return null;
  }

  login(user: Omit<User, 'password'>): { access_token: string } {
    const payload: JwtPayload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.authRepository.findUserByEmail(email);

    if (user) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.authRepository.createUser(email, hashedPassword);
    const { password: _, ...result } = newUser;

    return result;
  }
}
