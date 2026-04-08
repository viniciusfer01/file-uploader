import { BadRequestException, Injectable } from '@nestjs/common';
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

    const url = await this.storageService.upload(file);

    return this.prismaService.fileRecord.create({
      data: {
        name: file.originalname,
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
