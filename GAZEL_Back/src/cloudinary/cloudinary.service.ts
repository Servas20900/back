import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Sube una imagen a Cloudinary
   * @param file - Archivo a subir (Express.Multer.File)
   * @param folder - Carpeta en Cloudinary donde se guardará la imagen
   * @returns URL de la imagen subida y public_id
   */
  async uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{ url: string; publicId: string }> {
    try {
      const folderPath = folder || this.configService.get<string>('CLOUDINARY_FOLDER') || 'gazel';

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folderPath,
            resource_type: 'image',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error || !result) {
              return reject(new BadRequestException('Error al subir la imagen a Cloudinary'));
            }

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          },
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      throw new BadRequestException('Error al procesar la imagen');
    }
  }

  /**
   * Elimina una imagen de Cloudinary usando su public_id
   * @param publicId - El public_id de la imagen en Cloudinary
   * @returns Resultado de la eliminación
   */
  async deleteImage(publicId: string): Promise<{ result: string }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new BadRequestException('Error al eliminar la imagen de Cloudinary');
    }
  }

  /**
   * Extrae el public_id de una URL de Cloudinary
   * @param url - URL completa de Cloudinary
   * @returns public_id extraído
   */
  extractPublicId(url: string): string {
    try {
      // Formato típico: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      
      if (uploadIndex === -1) {
        throw new Error('URL de Cloudinary inválida');
      }

      // Tomar todo desde después de upload, ignorando la versión
      const pathAfterUpload = parts.slice(uploadIndex + 1);
      
      // Si tiene versión (v123456789), la ignoramos
      const pathWithoutVersion = pathAfterUpload[0].startsWith('v') 
        ? pathAfterUpload.slice(1) 
        : pathAfterUpload;

      // Unir el path y quitar la extensión del archivo
      const fullPath = pathWithoutVersion.join('/');
      return fullPath.substring(0, fullPath.lastIndexOf('.'));
    } catch (error) {
      throw new BadRequestException('No se pudo extraer el public_id de la URL');
    }
  }

  /**
   * Actualiza una imagen: elimina la anterior y sube la nueva
   * @param file - Nuevo archivo a subir
   * @param oldImageUrl - URL de la imagen anterior a eliminar
   * @param folder - Carpeta en Cloudinary
   * @returns URL de la nueva imagen y su public_id
   */
  async updateImage(
    file: Express.Multer.File,
    oldImageUrl?: string,
    folder?: string,
  ): Promise<{ url: string; publicId: string }> {
    // Subir la nueva imagen primero
    const newImage = await this.uploadImage(file, folder);

    // Intentar eliminar la imagen anterior
    if (oldImageUrl) {
      try {
        const publicId = this.extractPublicId(oldImageUrl);
        await this.deleteImage(publicId);
      } catch (error) {
        console.error('Error al eliminar la imagen anterior:', error);
        // No lanzamos error aquí para no afectar la actualización
      }
    }

    return newImage;
  }

  /**
   * Valida que el archivo sea una imagen válida
   * @param file - Archivo a validar
   * @param maxSizeInMB - Tamaño máximo en MB (default: 5MB)
   * @returns true si es válido, lanza excepción si no
   */
  validateImage(file: Express.Multer.File, maxSizeInMB: number = 5): boolean {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar tipo MIME
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no válido. Solo se permiten: JPEG, JPG, PNG, WEBP',
      );
    }

    // Validar tamaño
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new BadRequestException(
        `El archivo es demasiado grande. Tamaño máximo: ${maxSizeInMB}MB`,
      );
    }

    return true;
  }
}
