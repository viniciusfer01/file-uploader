import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  constructor(
    private readonly configService: ConfigService,
    private readonly s3Client: S3Client,
  ) {}

  async upload(file: Express.Multer.File) {
    const bucket = this.configService.getOrThrow<string>('STORAGE_BUCKET');
    const publicUrl = this.configService.getOrThrow<string>('STORAGE_PUBLIC_URL');
    const objectKey = `${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${publicUrl}/${bucket}/${objectKey}`;
  }
}

