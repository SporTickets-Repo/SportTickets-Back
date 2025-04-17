/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { isValidCPF, isValidPhone } from 'src/utils/validators';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';

interface JwtPayload {
  username: string;
  sub: string;
}

@Injectable()
export class AuthService {
  private readonly RESET_PASSWORD_PREFIX = 'reset-password:';
  private readonly RESET_PASSWORD_TTL = 900; // 15 minutos em segundos

  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  async validateUserByIdentifier(
    identifier: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    let user: User | null = null;

    if (identifier.includes('@')) {
      user = await this.authRepository.findUserByEmail(identifier);
    }

    if (!user && isValidCPF(identifier)) {
      user = await this.authRepository.findUserByDocument(identifier);
    }

    if (!user && isValidPhone(identifier)) {
      user = await this.authRepository.findUserByPhone(identifier);
    }

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

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    const [existingByEmail, existingByDocument, existingByPhone] =
      await Promise.all([
        this.authRepository.findUserByEmail(registerDto.email),
        this.authRepository.findUserByDocument(registerDto.document),
        registerDto.phone
          ? this.authRepository.findUserByPhone(registerDto.phone)
          : Promise.resolve(null),
      ]);

    if (existingByEmail) throw new ConflictException('Email already exists');
    if (existingByDocument) throw new ConflictException('CPF already exists');
    if (existingByPhone) throw new ConflictException('Phone already exists');

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const { confirmPassword, ...userData } = registerDto;

    const newUser = await this.authRepository.createUser({
      ...userData,
      password: hashedPassword,
      bornAt: new Date(userData.bornAt),
    });

    if (!newUser) {
      throw new InternalServerErrorException('Error creating user');
    }

    const { password: _, ...result } = newUser;
    return result;
  }

  async forgotPassword(
    email: string,
  ): Promise<{ message: string; token: string }> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tokenKey = `${this.RESET_PASSWORD_PREFIX}${user.id}`;

    let token = await this.redisService.get<string>(tokenKey);

    if (!token) {
      token = uuidv4();
      await this.redisService.set(tokenKey, token, this.RESET_PASSWORD_TTL);
    }

    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      token,
    );

    return { message: 'Reset password token sent', token };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const keys = await this.redisService.getKeys(
      `${this.RESET_PASSWORD_PREFIX}*`,
    );

    let userId: string | null = null;

    for (const key of keys) {
      const storedToken = await this.redisService.get<string>(key);
      if (storedToken === token) {
        userId = key.replace(this.RESET_PASSWORD_PREFIX, '');
        break;
      }
    }

    if (!userId) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updateUserPassword(user.id, hashedPassword);

    await this.redisService.del(`${this.RESET_PASSWORD_PREFIX}${user.id}`);

    return { message: 'Password reset successful' };
  }

  async checkResetPasswordToken(token: string) {
    const keys = await this.redisService.getKeys(
      `${this.RESET_PASSWORD_PREFIX}*`,
    );

    let userId: string | null = null;

    for (const key of keys) {
      const storedToken = await this.redisService.get<string>(key);
      if (storedToken === token) {
        userId = key.replace(this.RESET_PASSWORD_PREFIX, '');
        break;
      }
    }

    return !!userId;
  }

  async checkEmail(email: string) {
    const user = await this.authRepository.findUserByEmail(email);

    if (user && (!user.password || user.password.length === 0)) {
      throw new ConflictException('Account created by another user');
    }

    return !!user;
  }
}
