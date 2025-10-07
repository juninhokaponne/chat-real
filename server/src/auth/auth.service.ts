import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async signup(email: string, password: string, displayName: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('User already exists');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ email, password: hashed, displayName });
    const payload = { sub: user['_id'], email: user.email };
    return { access_token: this.jwtService.sign(payload) };
  }

  async signin(email: string, password: string, deviceName?: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    // check lock
    if (await this.usersService.isLocked((user as any)._id || (user as any).id)) {
      throw new UnauthorizedException('Account locked due to repeated failed login attempts');
    }
    const match = await bcrypt.compare(password, (user as any).password);
    if (!match) {
      // increment failed attempt
      await this.usersService.incrementFailedLogin((user as any)._id || (user as any).id);
      throw new UnauthorizedException('Invalid credentials');
    }
    // successful login: reset failed attempts
    await this.usersService.resetFailedLogin((user as any)._id || (user as any).id);
    const payload = { sub: (user as any)._id || (user as any).id, email: user.email };
  const tokens = { access_token: this.jwtService.sign(payload) };
  // ensure we pass a plain object with an _id so the usersService can persist the refresh jti
  const uid = (user as any)._id || (user as any).id;
  const refresh = await this.createRefreshToken({ _id: uid, email: user.email, deviceName });
    // Note: controller handles cookie setting; service returns both tokens
    return { ...tokens, refresh_token: refresh.refresh_token };
  }

  async validateUserById(id: string) {
    return this.usersService.findById(id);
  }

  createTokenForUser(user: any) {
    const payload = { sub: user._id || user.id, email: user.email };
    return { access_token: this.jwtService.sign(payload) };
  }

  async createRefreshToken(user: any) {
    // Create a signed JWT refresh token with a unique jti.
    const jti = uuidv4();
    const expiresIn = '7d';
    const payload = { sub: user._id || user.id, type: 'refresh', jti };
    const refreshToken = this.jwtService.sign(payload, { expiresIn });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    // attempt to capture deviceName if provided on user object or request context
    const deviceName = (user && (user.deviceName || user.device?.name)) || undefined;
    await this.usersService.addRefreshToken(user._id || user.id, jti, expiresAt, { deviceName });
    return { refresh_token: refreshToken, jti, expiresAt };
  }

  async refresh(_refreshToken: string) {
    // Find the user who has this refresh token
    // (simple approach: scan users collection for token — but we have verifyRefreshToken by userId, so expect client to supply userId too)
    // For simplicity, decode a small payload from token is not possible; instead, require userId + refreshToken in body in controller.
    throw new Error('Use controller refresh endpoint with userId and refreshToken');
  }
}
