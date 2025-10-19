import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  displayName: string;

  @IsOptional()
  deviceName?: string;
}
