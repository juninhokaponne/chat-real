import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';

jest.setTimeout(60000);

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let uri: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (mongod) await mongod.stop();
  });

  it('/auth/signup (POST) -> signin -> profile flow', async () => {
    const email = `e2e${Date.now()}@example.com`;
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'Password123!', displayName: 'E2E User' })
      .expect(201);

    expect(signupRes.body).toHaveProperty('access_token');

    const signinRes = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'demo@example.com', password: 'Password123!' })
      .expect(200);

    expect(signinRes.body).toHaveProperty('access_token');
    const token = signinRes.body.access_token;

    const profileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(profileRes.body).toHaveProperty('email');
  });
});
