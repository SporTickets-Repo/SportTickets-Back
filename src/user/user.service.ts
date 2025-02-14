/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { BlobService } from 'src/blob/blob.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly blobService: BlobService,
  ) {}

  private async checkConflicts(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<void> {
    const [emailTaken, phoneTaken, documentTaken] = await Promise.all([
      updateUserDto.email
        ? this.userRepository.isEmailTaken(updateUserDto.email, userId)
        : Promise.resolve(false),
      updateUserDto.phone
        ? this.userRepository.isPhoneTaken(updateUserDto.phone, userId)
        : Promise.resolve(false),
      updateUserDto.document
        ? this.userRepository.isDocumentTaken(updateUserDto.document, userId)
        : Promise.resolve(false),
    ]);

    if (emailTaken) {
      throw new ConflictException('E-mail already taken');
    }
    if (phoneTaken) {
      throw new ConflictException('Phone already taken');
    }
    if (documentTaken) {
      throw new ConflictException('Document already taken');
    }
  }

  async updateUser(
    user: User,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    await this.checkConflicts(user.id, updateUserDto);

    if (updateUserDto.bornAt) {
      updateUserDto.bornAt = new Date(updateUserDto.bornAt);
    }

    if (file) {
      try {
        const result = user.profileImageUrl
          ? await this.blobService.updateFile(
              user.profileImageUrl,
              file.originalname,
              file.buffer,
              'public',
              user.id,
            )
          : await this.blobService.uploadFile(
              file.originalname,
              file.buffer,
              'public',
              user.id,
            );

        if (result) {
          user.profileImageUrl = result.url;
        }
      } catch (error) {
        console.error('Error uploading file.', error);
      }
    }

    const userToUpdate: User = {
      ...user,
      ...updateUserDto,
    };

    const updatedUser: User = await this.userRepository.updateUser(
      user.id,
      userToUpdate,
    );

    const { password, ...result } = updatedUser;
    return result;
  }
}
