import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { del, list, put } from '@vercel/blob';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class BlobService {
  constructor(private readonly configService: AppConfigService) {}

  async uploadFile(
    fileName: string,
    content: Buffer,
    access: 'public' | 'private' = 'public',
    userId: string,
  ) {
    if (!fileName || !content || content.length === 0) {
      throw new BadRequestException('Invalid file name or content.');
    }

    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }

    const token = this.configService.blobToken;

    try {
      const filePath = `${userId}/${fileName}`;

      const { url } = await put(filePath, content, {
        access: access as 'public',
        token,
      });

      return { fileName, url };
    } catch {
      throw new InternalServerErrorException('Error uploading file.');
    }
  }

  async listFiles() {
    const token = this.configService.blobToken;

    try {
      const files = await list({ token });
      return files.blobs;
    } catch {
      throw new InternalServerErrorException('Error listing files.');
    }
  }

  async listUserFiles(userId: string) {
    const token = this.configService.blobToken;

    try {
      const files = await list({
        token,
        prefix: `${userId}/`,
      });

      return files.blobs;
    } catch {
      throw new InternalServerErrorException('Error listing user files.');
    }
  }

  async updateFile(
    url: string | undefined | null,
    fileName: string,
    content: Buffer,
    access: 'public' | 'private' = 'public',
    userId: string,
  ) {
    const token = this.configService.blobToken;

    if (!url) {
      throw new BadRequestException('File URL is required.');
    }

    try {
      await del(url, { token });
    } catch {
      throw new InternalServerErrorException('Error deleting file.');
    }

    return this.uploadFile(fileName, content, access, userId);
  }

  async deleteFile(url: string) {
    const token = this.configService.blobToken;

    const files = await this.listFiles();
    const fileToDelete = files.find((file) => file.url === url);

    if (!fileToDelete) {
      throw new NotFoundException('File not found.');
    }

    try {
      await del(url, { token });
    } catch {
      throw new InternalServerErrorException('Error deleting file.');
    }

    return { message: 'File successfully deleted', url };
  }

  async deleteAllFiles() {
    const token = this.configService.blobToken;

    const files = await this.listFiles();

    try {
      if (files.length > 0) {
        await del(
          files.map((blob) => blob.url),
          { token },
        );
      }
    } catch {
      throw new InternalServerErrorException('Error deleting all files.');
    }

    return { message: 'All files have been successfully deleted' };
  }
}
