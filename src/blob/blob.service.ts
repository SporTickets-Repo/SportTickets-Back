import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { lookup } from 'mime-types';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class BlobService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly nodeEnv: string;

  constructor(private readonly configService: AppConfigService) {
    const bucket = this.configService.s3Bucket;
    const accessKeyId = this.configService.s3AccessKeyId;
    const secretAccessKey = this.configService.s3SecretAccessKey;
    const nodeEnv = this.configService.nodeEnv;

    if (!bucket || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'Bucketeer config missing: bucket, accessKeyId or secretAccessKey not defined.',
      );
    }

    this.bucket = bucket;
    this.nodeEnv = nodeEnv || 'development';

    this.s3 = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(
    fileName: string,
    content: Buffer,
    _access: 'public' | 'private' = 'private',
    userId: string,
  ) {
    if (!fileName || !content || content.length === 0) {
      throw new BadRequestException('Invalid file name or content.');
    }

    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }

    const sanitizedFileName = fileName
      .replace(/[\r\n]+/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const key = `${this.nodeEnv === 'development' ? 'dev/' : ''}${userId}/${sanitizedFileName}`;

    const url = `https://${this.bucket}.s3.amazonaws.com/${encodeURIComponent(key)}`;

    try {
      const mimeType = lookup(fileName) || 'application/octet-stream';

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: content,
          ContentType: mimeType,
          ContentLength: content.length,
          ACL: 'public-read',
        }),
      );

      return { fileName: sanitizedFileName, url };
    } catch (err) {
      throw new InternalServerErrorException('Error uploading file.');
    }
  }

  async listFiles() {
    try {
      const result = await this.s3.send(
        new ListObjectsV2Command({ Bucket: this.bucket }),
      );

      return (
        result.Contents?.map((obj) => ({
          key: obj.Key,
          url: `https://${this.bucket}.s3.amazonaws.com/${obj.Key}`,
        })) || []
      );
    } catch {
      throw new InternalServerErrorException('Error listing files.');
    }
  }

  async listUserFiles(userId: string) {
    try {
      const result = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: `${userId}/`,
        }),
      );

      return (
        result.Contents?.map((obj) => ({
          key: obj.Key,
          url: `https://${this.bucket}.s3.amazonaws.com/${obj.Key}`,
        })) || []
      );
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
    if (!url) {
      throw new BadRequestException('File URL is required.');
    }

    const key = this.getKeyFromUrl(url);

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch {
      throw new InternalServerErrorException('Error deleting file.');
    }

    return this.uploadFile(fileName, content, access, userId);
  }

  async deleteFile(url: string) {
    const key = this.getKeyFromUrl(url);

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return { message: 'File successfully deleted', url };
    } catch {
      throw new InternalServerErrorException('Error deleting file.');
    }
  }

  async deleteAllFiles() {
    const files = await this.listFiles();

    if (files.length === 0) {
      return { message: 'No files to delete.' };
    }

    try {
      await this.s3.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: files.map((f) => ({ Key: f.key })),
            Quiet: true,
          },
        }),
      );
    } catch {
      throw new InternalServerErrorException('Error deleting all files.');
    }

    return { message: 'All files have been successfully deleted' };
  }
  private getKeyFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      if (!parsedUrl.hostname.includes('amazonaws.com')) {
        throw new Error('Not an S3 URL');
      }
      return decodeURIComponent(
        pathname.startsWith('/') ? pathname.slice(1) : pathname,
      );
    } catch {
      throw new BadRequestException('Invalid file URL.');
    }
  }
}
