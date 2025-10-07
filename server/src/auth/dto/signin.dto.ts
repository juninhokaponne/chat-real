import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  deviceName?: string;
}
