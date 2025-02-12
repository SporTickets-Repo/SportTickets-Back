/* eslint-disable @typescript-eslint/no-unused-vars */
// src/user/user.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.email) {
      const emailTaken = await this.userRepository.isEmailTaken(
        updateUserDto.email,
        userId,
      );
      if (emailTaken) {
        throw new ConflictException('E-mail already taken');
      }
    }

    if (updateUserDto.phone) {
      const phoneTaken = await this.userRepository.isPhoneTaken(
        updateUserDto.phone,
        userId,
      );
      if (phoneTaken) {
        throw new ConflictException('Phone already taken');
      }
    }

    if (updateUserDto.document) {
      const documentTaken = await this.userRepository.isDocumentTaken(
        updateUserDto.document,
        userId,
      );
      if (documentTaken) {
        throw new ConflictException('Document already taken');
      }
    }

    const updatedUser = await this.userRepository.updateUser(userId, {
      ...updateUserDto,
      bornAt: updateUserDto.bornAt ? new Date(updateUserDto.bornAt) : undefined,
    });
    const { password: _, ...result } = updatedUser;
    return result;
  }
}
