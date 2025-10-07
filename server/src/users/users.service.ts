import { createHash } from 'crypto';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    const demoEmail = 'demo@example.com';
    const existing = await this.userModel.findOne({ email: demoEmail }).exec();
    if (!existing) {
      const hashed = await bcrypt.hash('Password123!', 10);
      const demo = new this.userModel({
        email: demoEmail,
        password: hashed,
        displayName: 'Demo User',
      });
      await demo.save();
      this.logger.log('Created demo user demo@example.com');
    } else {
      this.logger.log('Demo user already exists');
    }
  }

  async create(user: Partial<User>): Promise<User> {
    const created = new this.userModel({ ...user, refreshTokens: [], failedLoginAttempts: 0 });
    return created.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Find user by email and include the password field (used for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    // select '+password' ensures password field included despite schema select:false
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  // Refresh tokens are stored as JWT ids (jti) with expiry. We never store the raw signed token.
  private hashJti(jti: string) {
    return createHash('sha256').update(jti).digest('hex');
  }

  async addRefreshToken(userId: string, jti: string, expiresAt: Date, meta?: { userAgent?: string; ip?: string; deviceName?: string }) {
    const hj = this.hashJti(jti);
    const createdAt = new Date();
    const entry: any = { jti: hj, expiresAt, createdAt };
    if (meta?.userAgent) entry.userAgent = meta.userAgent;
    if (meta?.ip) entry.ip = meta.ip;
    if (meta?.deviceName) entry.deviceName = meta.deviceName;
    return this.userModel.findByIdAndUpdate(userId, { $push: { refreshTokens: entry } }, { new: true }).exec();
  }

  async removeRefreshToken(userId: string, jti: string) {
    const hj = this.hashJti(jti);
    return this.userModel.findByIdAndUpdate(userId, { $pull: { refreshTokens: { jti: hj } } }, { new: true }).exec();
  }

  // Revoke a single session by raw jti (hashed in DB)
  async revokeSession(userId: string, jti: string) {
    return this.removeRefreshToken(userId, jti);
  }

  async verifyRefreshToken(userId: string, jti: string) {
    const hj = this.hashJti(jti);
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.refreshTokens) return false;
    const rt = (user.refreshTokens as any).find((r: any) => r.jti === hj);
    if (!rt) return false;
    return new Date(rt.expiresAt) > new Date();
  }

  async findByRefreshTokenJti(jti: string): Promise<User | null> {
    const hj = this.hashJti(jti);
    return this.userModel.findOne({ 'refreshTokens.jti': hj }).exec();
  }

  // remove all refresh tokens for a user (revoke all sessions)
  async removeAllRefreshTokens(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } }, { new: true }).exec();
  }

  // list active (non-expired) refresh token jtis for a user (hashed values)
  async listActiveRefreshJtis(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.refreshTokens) return [];
    const now = new Date();
    return (user.refreshTokens as any)
      .filter((r: any) => new Date(r.expiresAt) > now)
      .map((r: any) => ({ jti: r.jti, createdAt: r.createdAt, userAgent: r.userAgent, ip: r.ip, deviceName: r.deviceName }));
  }

  async incrementFailedLogin(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return;
    const attempts = (user.failedLoginAttempts || 0) + 1;
    const lockUntil = attempts >= 5 ? new Date(Date.now() + 60 * 60 * 1000) : user.lockUntil;
    user.failedLoginAttempts = attempts;
    if (lockUntil) user.lockUntil = lockUntil;
    await user.save();
  }

  async resetFailedLogin(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, { failedLoginAttempts: 0, lockUntil: null }, { new: true }).exec();
  }

  async isLocked(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return false;
    if (!user.lockUntil) return false;
    return new Date(user.lockUntil) > new Date();
  }
}
