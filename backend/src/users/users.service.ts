import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { userSelect } from './user-select';
import { HashService } from 'src/common/hash/hash.service';
import { AppError } from 'src/common/utils/app-error.utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
  ) {}

  async findAll() {
    return await this.prisma.user.findMany({ select: userSelect });
  }

  async findOne(id: string) {
    return await this.prisma.user.findFirst({
      where: { id },
      select: userSelect,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { phone: updateUserDto.phone },
      select: { phone: true },
    });

    if (existing?.phone == updateUserDto.phone) {
      throw AppError.conflict('Phone', {
        message: 'Phone number is already used, try another!',
      });
    }

    return await this.prisma.user.update({
      where: { id },
      data: { ...updateUserDto },
      select: userSelect,
    });
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
