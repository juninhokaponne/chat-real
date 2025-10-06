import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.example'] }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/chat-real'),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
