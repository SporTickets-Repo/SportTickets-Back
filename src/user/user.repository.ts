// src/user/user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) { }



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

  async isDocumentTaken(document: string, excludeUserId?: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        document,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
    });
    return Boolean(user);
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    let dataToUpdate = { ...updateUserDto };
    return this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });
  }
}
