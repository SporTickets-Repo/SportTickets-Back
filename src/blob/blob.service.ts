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
      throw new BadRequestException('Nome do arquivo ou conteúdo inválido.');
    }

    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório.');
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
      throw new InternalServerErrorException(
        'Erro ao fazer upload do arquivo.',
      );
    }
  }

  async listFiles() {
    const token = this.configService.blobToken;

    try {
      const files = await list({ token });
      return files.blobs;
    } catch {
      throw new InternalServerErrorException('Erro ao listar os arquivos.');
    }
  }

  async deleteFile(url: string) {
    const token = this.configService.blobToken;

    const files = await this.listFiles();
    const fileToDelete = files.find((file) => file.url === url);

    if (!fileToDelete) {
      throw new NotFoundException('Arquivo não encontrado.');
    }

    try {
      await del(url, { token });
    } catch {
      throw new InternalServerErrorException('Erro ao deletar o arquivo.');
    }

    return { message: 'Arquivo deletado com sucesso', url };
  }

  async updateFile(
    url: string | undefined | null,
    fileName: string,
    content: Buffer,
    access: 'public' | 'private' = 'public',
  ) {
    const token = this.configService.blobToken;

    if (url) {
      try {
        await del(url, { token });
      } catch {
        throw new InternalServerErrorException('Erro ao deletar o arquivo.');
      }
    }

    return this.uploadFile(fileName, content, access);
  }

  async deleteAllFiles() {
    const token = this.configService.blobToken;

    const files = await this.listFiles();

    try {
      await Promise.all(
        files.map(async (file) => {
          await del(file.url, { token });
        }),
      );
    } catch {
      throw new InternalServerErrorException('Erro ao deletar os arquivos.');
    }

    return { message: 'Todos os arquivos foram deletados com sucesso' };
  }
}
