import { BadRequestException, Injectable } from '@nestjs/common';
import { normalizeUploadedFilename } from './file-name.util';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

@Injectable()
export class FilesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(file: Express.Multer.File) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type.');
    }

    const normalizedName = normalizeUploadedFilename(file.originalname);
    file.originalname = normalizedName;
    const url = await this.storageService.upload(file);

    return this.prismaService.fileRecord.create({
      data: {
        name: normalizedName,
        type: file.mimetype,
        size: file.size,
        url,
      },
    });
  }

  async list() {
    return this.prismaService.fileRecord.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
