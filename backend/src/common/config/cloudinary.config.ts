import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DEFAULT_FOLDER = 'PrintAja/Avatar';

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  options?: UploadApiOptions,
): Promise<UploadApiResponse> => {
  if (!file) {
    throw new BadRequestException('File is required');
  }

  if (!file.buffer) {
    throw new BadRequestException('Invalid file buffer');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: DEFAULT_FOLDER,
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(
            new InternalServerErrorException(
              'Failed to upload image to Cloudinary',
            ),
          );
        }

        if (!result) {
          return reject(
            new InternalServerErrorException('No result from Cloudinary'),
          );
        }

        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!publicId) {
    throw new BadRequestException('Public ID is required');
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    throw new InternalServerErrorException(
      'Failed to delete image from Cloudinary',
    );
  }
};

export default cloudinary;
