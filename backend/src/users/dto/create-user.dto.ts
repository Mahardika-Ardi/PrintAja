import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from 'generated/prisma/enums';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @IsStrongPassword(
    {},
    {
      message:
        'Password must be at least 8 characters and contain uppercase letters, numbers, and symbols',
    },
  )
  password!: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  @IsPhoneNumber('ID', {
    message:
      'Phone number must be a valid Indonesian phone number (e.g. +6281234567890)',
  })
  phone!: string;

  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  firstName!: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  lastName!: string;

  @Type(() => Date)
  @IsNotEmpty({ message: 'Birth date is required' })
  @IsDate({ message: 'Birth date must be a valid date' })
  birthDate!: Date;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsEnum(Gender, {
    message: `Gender must be one of the following values: ${Object.values(Gender).join(', ')}`,
  })
  gender!: Gender;
}
