import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new S3Client({
          region: configService.getOrThrow<string>('STORAGE_REGION'),
          endpoint: configService.getOrThrow<string>('STORAGE_ENDPOINT'),
          forcePathStyle: true,
          credentials: {
            accessKeyId: configService.getOrThrow<string>('STORAGE_ACCESS_KEY'),
            secretAccessKey: configService.getOrThrow<string>('STORAGE_SECRET_KEY'),
          },
        }),
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}

