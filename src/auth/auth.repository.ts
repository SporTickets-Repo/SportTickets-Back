import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

type CreateUserInput = Omit<
  Prisma.UserCreateInput,
  'id' | 'createdAt' | 'updatedAt'
>;
@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findUserByDocument(document: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { document },
    });
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async createUser(data: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUserPassword(id: string, newPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { password: newPassword },
    });
  }

  async updateUser(userId: string, data: User): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
