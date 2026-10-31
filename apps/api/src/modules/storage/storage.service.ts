import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import * as Minio from 'minio';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: Minio.Client;
  private readonly bucketName = process.env.MINIO_BUCKET_NAME || 'patinhas-media';
  private readonly publicUrl = process.env.MINIO_PUBLIC_URL || 'http://localhost:9010';

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'minio',
      port: Number(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ROOT_USER || 'patinhas_admin',
      secretKey: process.env.MINIO_ROOT_PASSWORD || 'patinhas_admin_secret',
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket MinIO '${this.bucketName}' criado com sucesso.`);

        // Política de leitura pública anônima para servir imagens no frontend
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetBucketLocation', 's3:ListBucket'],
              Resource: [`arn:aws:s3:::${this.bucketName}`],
            },
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        this.logger.log(`Política de acesso público configurada para o bucket '${this.bucketName}'.`);
      } else {
        this.logger.log(`Bucket MinIO '${this.bucketName}' já existente e operacional.`);
      }
    } catch (error) {
      this.logger.error('Erro ao inicializar bucket no MinIO:', error);
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    // Validação de tipos permitidos (fotos)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Formato de arquivo inválido. Formatos permitidos: JPG, PNG, WEBP, GIF');
    }

    // Tamanho máximo: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Tamanho máximo permitido de imagem é 10MB');
    }

    const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg';
    const objectName = `${folder}/${crypto.randomUUID()}${fileExt}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      const fileUrl = `${this.publicUrl}/${this.bucketName}/${objectName}`;
      this.logger.log(`Arquivo enviado com sucesso para MinIO: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      this.logger.error('Erro ao enviar arquivo para o MinIO:', error);
      throw new BadRequestException('Erro no serviço de armazenamento');
    }
  }

  async deleteFile(objectUrl: string): Promise<void> {
    try {
      // Extrai o nome do objeto a partir da URL
      const prefix = `${this.publicUrl}/${this.bucketName}/`;
      if (objectUrl.startsWith(prefix)) {
        const objectName = objectUrl.replace(prefix, '');
        await this.minioClient.removeObject(this.bucketName, objectName);
        this.logger.log(`Arquivo removido do MinIO: ${objectName}`);
      }
    } catch (error) {
      this.logger.warn(`Não foi possível remover o arquivo '${objectUrl}' do MinIO:`, error);
    }
  }
}
