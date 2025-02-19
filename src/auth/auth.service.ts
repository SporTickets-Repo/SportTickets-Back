/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { isValidCPF, isValidPhone } from 'src/utils/validators';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';

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
}
