import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { BlobService } from 'src/blob/blob.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

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
        this.logger.error('Error uploading file.', error);
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

  async updateUserRole(userId: string, updateRoleDto: UpdateRoleDto) {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userRepository.updateUserRole(userId, updateRoleDto.role);
  }

  async getUsers() {
    const users = await this.userRepository.getUsers();

    const result = users.map(({ password, ...user }) => user);

    return result;
  }

  async getUserByIdentifier(identifier: string, userId: string) {
    const existingUser =
      await this.userRepository.getUserByIdentifier(identifier);

    if (existingUser?.id === userId) {
      throw new ConflictException('You cannot add yourself as a collaborator');
    }

    return {
      exist: Boolean(existingUser),
      user: existingUser,
    };
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { id, email: userEmail, phone, name, profileImageUrl, sex } = user;
    return { userId: id, email: userEmail, phone, name, profileImageUrl, sex };
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const [existingByEmail, existingByDocument, existingByPhone] =
      await Promise.all([
        this.userRepository.findUserByEmailRegister(registerUserDto.email),
        this.userRepository.findUserByDocument(registerUserDto.document),
        registerUserDto.phone
          ? this.userRepository.findUserByPhone(registerUserDto.phone)
          : Promise.resolve(null),
      ]);

    if (existingByEmail) throw new ConflictException('Email already exists');
    if (existingByDocument) throw new ConflictException('CPF already exists');
    if (existingByPhone) throw new ConflictException('Phone already exists');

    const newUser = await this.userRepository.createUser({
      ...registerUserDto,
      bornAt: new Date(registerUserDto.bornAt),
      phone: registerUserDto.phone ?? null,
      documentType: 'CPF',
      password: '',
      role: 'USER',
      profileImageUrl: null,
      siteUrl: null,
      logoUrl: null,
      fantasyName: null,
    });

    if (!newUser) {
      throw new InternalServerErrorException('Error creating user');
    }

    return {
      userId: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      name: newUser.name,
      profileImageUrl: newUser.profileImageUrl,
      sex: newUser.sex,
    };
  }
}
