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

  async uploadFile(files: Express.Multer.File | Express.Multer.File[]): Promise<string[]> {
    const bucket = minioConfig.bucketName;
    const fileUrls: string[] = [];
  
    const filesArray = Array.isArray(files) ? files : [files];
  
    console.log('Received files:', filesArray);
  
    await Promise.all(
      filesArray.map(async (file) => {
        console.log('File:', file);
                if (!file || !file.buffer) {
          this.logger.error('Fichier ou buffer manquant pour le téléchargement');
          throw new Error('Fichier ou buffer manquant');
        }
  
        console.log('File details:', file);
        
        this.logger.log(`Uploading file: ${file.originalname}`);
        const objectName = `${Date.now()}-${file.originalname}`;
        const stream = Readable.from(file.buffer);
  
        try {
          await this.minioClient.putObject(bucket, objectName, stream, file.size);
          this.logger.log(`File '${objectName}' uploaded successfully.`);
  
          const protocol = minioConfig.useSSL ? 'https' : 'http';
          const fileUrl = `${protocol}://${minioConfig.endPoint}:${minioConfig.port}/${bucket}/${objectName}`;
          fileUrls.push(fileUrl);
        } catch (error) {
          this.logger.error(`Error uploading file: ${objectName}`, error.stack);
          throw new Error(`Failed to upload file: ${objectName}`);
        }
      })
    );
  
    return fileUrls;
  }
  
  
  
  
}

