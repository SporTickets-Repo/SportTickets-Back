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
  ) {
    if (!fileName || !content || content.length === 0) {
      throw new BadRequestException('Nome do arquivo ou conteúdo inválido.');
    }

    const token = this.configService.blobToken;

    try {
      const { url } = await put(fileName, content, {
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
}
