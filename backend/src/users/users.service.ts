import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { userSelect } from './user.select';
import { HashService } from 'src/common/hash/hash.service';
import { AppError } from 'src/common/utils/app-error.utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { phone: createUserDto.phone ?? undefined },
        ],
      },
      select: { email: true, phone: true },
    });

    if (existing?.email == createUserDto.email) {
      throw AppError.conflict('Email', {
        message: 'E - Mail is already used, try another!',
      });
    }
    if (existing?.phone === createUserDto.phone) {
      throw AppError.conflict('Phone', {
        message: 'Phone number is already used, try another!',
      });
    }

    const hashedPassword = await this.hash.hash(createUserDto.password);

    return await this.prisma.user.create({
      data: { ...createUserDto, password: hashedPassword },
      select: { ...userSelect },
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
