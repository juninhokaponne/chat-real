import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ select: false })
  password?: string;

  @Prop()
  googleId?: string;

  @Prop({ required: true })
  displayName: string;

  // store refresh token identifiers (jti) instead of raw token values; tokens themselves are signed JWTs
  @Prop({ type: [{ jti: String, expiresAt: Date, createdAt: Date, userAgent: String, ip: String, deviceName: String }] })
  refreshTokens?: { jti: string; expiresAt: Date; createdAt?: Date; userAgent?: string; ip?: string; deviceName?: string }[];

  @Prop({ default: 0 })
  failedLoginAttempts?: number;

  @Prop()
  lockUntil?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
