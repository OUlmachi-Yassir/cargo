import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { Readable } from 'stream';
import { minioConfig } from './minio.config';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Client;

  constructor() {
    this.minioClient = new Client({
      endPoint: minioConfig.endPoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    });

    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    const bucket = minioConfig.bucketName;
    const exists = await this.minioClient.bucketExists(bucket).catch(() => false);
    if (!exists) {
      await this.minioClient.makeBucket(bucket, 'us-east-1');
      this.logger.log(`Bucket '${bucket}' created successfully.`);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket = minioConfig.bucketName;
    const objectName = `${Date.now()}-${file.originalname}`;

    const stream = Readable.from(file.buffer);
    await this.minioClient.putObject(bucket, objectName, stream, file.size);
    this.logger.log(`File '${objectName}' uploaded successfully.`);

    return `${minioConfig.endPoint}:${minioConfig.port}/${bucket}/${objectName}`;
  }
}
