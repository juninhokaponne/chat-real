import { Controller, Post, Body, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

class RefreshDto {
  userId: string;
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignUpDto) {
    console.log('[auth][signup] payload:', { email: dto.email, displayName: dto.displayName });
    try {
      const out = await this.authService.signup(dto.email, dto.password, dto.displayName);
      // create refresh token with deviceName on signup
      // Note: signup currently returns access token only; to persist deviceName for initial session we'd need user created info
      return out;
    } catch (_err) {
      console.error('[auth][signup] error:', _err?.message || _err);
      throw _err;
    }

  }

  @Post('signin')
  async signin(@Body() dto: SignInDto, @Res() res: Response) {
    console.log('[auth][signin] payload:', { email: dto.email, deviceName: (dto as any).deviceName });
    try {
      // pass deviceName as part of signin so the refresh token session can capture it
      const tokens: any = await this.authService.signin(dto.email, dto.password, (dto as any).deviceName);
      if (tokens.refresh_token) {
        res.cookie('refresh_token', tokens.refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
      }
      // For local testing (non-production), also include the refresh token in the JSON response so tests/tooling can use it.
      if (process.env.NODE_ENV !== 'production') {
        return res.status(200).json({ access_token: tokens.access_token, refresh_token: tokens.refresh_token });
      }
      return res.status(200).json({ access_token: tokens.access_token });
    } catch (_err) {
      console.error('[auth][signin] error:', _err?.message || _err);
      throw _err;
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // starts the OAuth2 flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // Passport will attach user to req.user
    const user: any = req.user;
    const token = this.authService.createTokenForUser(user);
    // For better security, set httpOnly cookie for refresh token and return JSON with access token
    // Try to provide deviceName from query if popup mounted
    const deviceName = (req.query && (req.query as any).deviceName) || undefined;
    const refresh = await this.authService.createRefreshToken({ ...user, deviceName });
    res.cookie('refresh_token', refresh.refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
    // Support both popup flows and normal redirect: if request was from popup (has query popup=1), return HTML that posts token to opener
    if (req.query && (req.query as any).popup === '1') {
      // return small HTML page that posts the access_token to opener and closes window
      const html = `<!doctype html><html><body><script>window.opener.postMessage({ access_token: '${token.access_token}' }, window.location.origin); window.close();</script></body></html>`;
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }
    return res.json({ access_token: token.access_token });
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshDto, @Req() req: any, @Res() res: Response) {
  const rawToken = body.refreshToken || req.cookies?.refresh_token;
  console.log('[auth][refresh] tokenSource:', body.refreshToken ? 'body' : (req.cookies?.refresh_token ? 'cookie' : 'none'));
  if (!rawToken) return res.status(400).json({ message: 'refreshToken required' });
    try {
  const decoded: any = this.authService['jwtService'].verify(rawToken);
  console.log('[auth][refresh] decoded:', decoded);
      if (!decoded || decoded.type !== 'refresh' || !decoded.jti) return res.status(401).json({ message: 'Invalid refresh token' });
      const userId = decoded.sub;
      const jti = decoded.jti;
      const ok = await (this as any).authService.usersService.verifyRefreshToken(userId, jti);
      if (!ok) return res.status(401).json({ message: 'Invalid or expired refresh token' });
      const user = await (this as any).authService.usersService.findById(userId);
  const access = this.authService.createTokenForUser(user);
  // rotate: remove old jti and create a new refresh JWT + jti
  await (this as any).authService.usersService.removeRefreshToken(userId, jti);
  const newRefresh = await this.authService.createRefreshToken(user);
  res.cookie('refresh_token', newRefresh.refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
  // return richer user info so frontend can set user without another profile request
  const payload: any = { access_token: access.access_token, user: { userId: user._id || user.id, email: user.email, displayName: user.displayName || user.name } };
  // in non-production expose refresh_token in body for local testing convenience
  if (process.env.NODE_ENV !== 'production') payload.refresh_token = newRefresh.refresh_token;
  return res.json(payload);
    } catch (_err) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  }

  @Post('logout')
  async logout(@Body() body: RefreshDto, @Req() req: any, @Res() res: Response) {
    const rawToken = body.refreshToken || req.cookies?.refresh_token;
    if (rawToken) {
      try {
        const decoded: any = this.authService['jwtService'].verify(rawToken);
        if (decoded && decoded.jti && decoded.sub) {
          await (this as any).authService.usersService.removeRefreshToken(decoded.sub, decoded.jti);
        }
      } catch (_err) {
        // ignore invalid token here; just clear cookie
      }
    }
    res.clearCookie('refresh_token');
    return res.json({ ok: true });
  }

  // Revoke all refresh tokens for the given user (logout everywhere)
  @Post('revoke-all')
  async revokeAll(@Body() body: { userId: string }, @Res() res: Response) {
    if (!body || !body.userId) return res.status(400).json({ message: 'userId required' });
    await (this as any).authService.usersService.removeAllRefreshTokens(body.userId);
    return res.json({ ok: true });
  }

  // Admin: list active refresh jtis (hashed) for a user
  @Get('refresh-tokens/:userId')
  async listRefreshTokens(@Req() req: any, @Res() res: Response) {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const list = await (this as any).authService.usersService.listActiveRefreshJtis(userId);
    return res.json({ tokens: list });
  }

  // List sessions for authenticated user (or admin). JWT protected.
  @Get('sessions/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getSessions(@Req() req: any, @Res() res: Response) {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    // allow only the owner to view
    if (req.user.userId !== userId) return res.status(403).json({ message: 'forbidden' });
    const list = await (this as any).authService.usersService.listActiveRefreshJtis(userId);
    return res.json({ sessions: list });
  }

  // Revoke a single session by jti (owner only)
  @Post('revoke-session')
  @UseGuards(AuthGuard('jwt'))
  async revokeSession(@Body() body: { userId: string; jti: string }, @Req() req: any, @Res() res: Response) {
    if (!body || !body.userId || !body.jti) return res.status(400).json({ message: 'userId and jti required' });
    if (req.user.userId !== body.userId) return res.status(403).json({ message: 'forbidden' });
    await (this as any).authService.usersService.revokeSession(body.userId, body.jti);
    return res.json({ ok: true });
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return req.user;
  }
}
