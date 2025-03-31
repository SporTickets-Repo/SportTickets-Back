import { Injectable } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
    });
    return Boolean(user);
  }

  async isPhoneTaken(phone: string, excludeUserId?: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        phone,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
    });
    return Boolean(user);
  }

  async isDocumentTaken(
    document: string,
    excludeUserId?: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        document,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
    });
    return Boolean(user);
  }

  async updateUser(userId: string, updatedUser: User): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: updatedUser,
    });
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async updateUserRole(userId: string, role: Role): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserByIdentifier(identifier: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: identifier, mode: 'insensitive' } },
          { document: { contains: identifier, mode: 'insensitive' } },
        ],
      },
    });
  }

  async findUserByEmail(identifier: string): Promise<Partial<User> | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: identifier, mode: 'insensitive' } },
          { document: { contains: identifier, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        profileImageUrl: true,
        sex: true,
      },
    }) as Promise<Partial<User> | null>;
  }

  async findUserByEmailRegister(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserByDocument(document: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { document } });
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async createUser(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        phone: data.phone ?? null,
      },
    });
  }
}
