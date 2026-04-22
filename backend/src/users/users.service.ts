import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { userAdminSelect, userMeSelect } from './user-select';
import { AppError } from 'src/common/utils/app-error.utils';
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from 'src/common/config/cloudinary.config';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const find = await this.prisma.user.findMany({ select: userAdminSelect });

    if (!find) {
      throw AppError.notFound('Account', { message: 'User not found' });
    }

    return find;
  }

  async findOne(id: string) {
    const find = await this.prisma.user.findFirst({
      where: { id },
      select: userMeSelect,
    });

    if (!find) {
      throw AppError.notFound('Account', { message: 'User not found' });
    }

    return find;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    let oldPublicId: string | null = null;

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { avatarPublicId: true },
    });

    oldPublicId = user?.avatarPublicId ?? null;

    if (file) {
      const uploadResult = await uploadToCloudinary(file);

      updateUserDto.avatarUrl = uploadResult.url;
      updateUserDto.avatarPublicId = uploadResult.public_id;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: userMeSelect,
    });

    if (file && oldPublicId) {
      await deleteFromCloudinary(oldPublicId);
    }

    return updatedUser;
  }

  async remove(id: string) {
    await this.prisma.user.delete({ where: { id }, select: { id: true } });
    return 'Successfully deleting user';
  }
}
