import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { Env } from '../../env';

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const PRESIGNED_URL_EXPIRES_IN = 300; // 5 minutes

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly cdnUrl: string;

  constructor(private configService: ConfigService<Env, true>) {
    const region = this.configService.getOrThrow<string>('AWS_S3_REGION');
    const accessKeyId =
      this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.getOrThrow<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    const cdnUrl = this.configService.getOrThrow<string>('AWS_S3_CDN_URL');

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      requestChecksumCalculation: 'when_required',
      responseChecksumValidation: 'when_required',
    });
    this.bucket = bucket;
    this.cdnUrl = cdnUrl.replace(/\/$/, '');
  }

  isAllowedContentType(contentType: string): boolean {
    return ALLOWED_CONTENT_TYPES.has(contentType);
  }

  async getPresignedPutUrl(
    filename: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; finalUrl: string }> {
    const ext = filename.split('.').pop() ?? '';
    const key = `uploads/${randomUUID()}${ext ? `.${ext}` : ''}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: PRESIGNED_URL_EXPIRES_IN,
    });

    return { uploadUrl, finalUrl: `${this.cdnUrl}/${key}` };
  }

  isOwnedUrl(url: string): boolean {
    return url.startsWith(this.cdnUrl);
  }

  async deleteFile(url: string): Promise<void> {
    if (!this.isOwnedUrl(url)) return;
    const key = url.slice(this.cdnUrl.length + 1); // strip leading slash
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
