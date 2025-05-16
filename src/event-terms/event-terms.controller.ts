import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Role, User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpsertTermDto } from './dto/upsert-term.dto';
import { EventTermsService } from './event-terms.service';

@Controller('events/:eventId/terms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventTermsController {
  constructor(private readonly service: EventTermsService) {}

  @Put()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 20 }]))
  @Roles(Role.PARTNER, Role.ADMIN)
  async updateTerms(
    @Param('eventId') eventId: string,
    @Req() req: { user: User },
    @UploadedFiles() uploaded: { files?: Express.Multer.File[] } | undefined,
    @Body('terms') termsRaw: string,
    @Body('fileIndices') fileIndicesRaw: string | string[],
  ) {
    let terms: UpsertTermDto[];

    try {
      const parsed = JSON.parse(termsRaw);

      if (!Array.isArray(parsed)) {
        throw new Error('Parsed value is not an array');
      }

      terms = plainToInstance(UpsertTermDto, parsed);

      const errors = terms.flatMap((term, index) =>
        validateSync(term, { whitelist: true }).map((e) => ({
          index,
          error: e.toString(),
        })),
      );

      if (errors.length > 0) {
        throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
      }
    } catch (err) {
      throw new BadRequestException(
        'The "terms" field must be a valid JSON containing a list of valid terms.',
      );
    }

    let fileIndices: number[] = [];
    const files = uploaded?.files ?? [];

    if (files.length > 0) {
      try {
        if (Array.isArray(fileIndicesRaw)) {
          fileIndices = fileIndicesRaw
            .map((val) => Number(val))
            .filter((val) => !isNaN(val));
        } else {
          const parsed = JSON.parse(fileIndicesRaw);
          if (Array.isArray(parsed)) {
            fileIndices = parsed.filter((i) => typeof i === 'number');
          } else if (typeof parsed === 'number') {
            fileIndices = [parsed];
          }
        }
      } catch {
        throw new BadRequestException(
          'The "fileIndices" field must be a valid JSON array or list of numbers.',
        );
      }
    }

    const newTermsCount = terms.filter((t) => !t.id).length;
    if (newTermsCount > files.length) {
      throw new BadRequestException(
        `There are ${newTermsCount} terms without IDs, but only ${files.length} file(s) were uploaded.`,
      );
    }

    return this.service.syncEventTerms(
      eventId,
      req.user,
      { terms },
      files,
      fileIndices,
    );
  }
}
