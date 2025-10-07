import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService, private usersService: UsersService) {
    const clientID = config.get<string>('OAUTH_GOOGLE_CLIENT_ID');
    const clientSecret = config.get<string>('OAUTH_GOOGLE_CLIENT_SECRET');
    const callbackURL = config.get<string>('OAUTH_GOOGLE_CALLBACK') || 'http://localhost:3000/auth/google/callback';

    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth client ID and secret must be set in environment variables (OAUTH_GOOGLE_CLIENT_ID / OAUTH_GOOGLE_CLIENT_SECRET)');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { id, displayName, emails } = profile;
    const email = emails && emails[0] && emails[0].value;
    let user = await this.usersService.findByGoogleId(id);
    if (!user && email) {
      user = await this.usersService.findByEmail(email);
    }
    if (!user) {
      user = await this.usersService.create({
        googleId: id,
        email,
        displayName: displayName || email,
      });
    } else if (!user.googleId) {
      // attach googleId if missing
      user.googleId = id;
      await (user as any).save();
    }
    done(null, user);
  }
}
