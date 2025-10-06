import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';

jest.setTimeout(60000);

describe('Auth deviceName persistence (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let uri: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (mongod) await mongod.stop();
  });

  it('stores deviceName on signin and sessions endpoint returns it', async () => {
    const email = `dn${Date.now()}@example.com`;
    const password = 'Password123!';
    // signup first
    const signup = await request(app.getHttpServer()).post('/auth/signup').send({ email, password, displayName: 'DN User' }).expect(201);
    expect(signup.body).toHaveProperty('access_token');

    // signin with deviceName
    const deviceName = 'My Test Laptop';
    const signin = await request(app.getHttpServer()).post('/auth/signin').send({ email, password, deviceName }).expect(200);
    expect(signin.body).toHaveProperty('access_token');
    const token = signin.body.access_token;

    // get sessions for user
    // need to fetch profile to get userId
    const profile = await request(app.getHttpServer()).get('/auth/profile').set('Authorization', `Bearer ${token}`).expect(200);
    const userId = profile.body.userId || profile.body._id || profile.body.id;
    expect(userId).toBeDefined();

  const sessions = await request(app.getHttpServer()).get(`/auth/sessions/${userId}`).set('Authorization', `Bearer ${token}`).expect(200);
  expect(sessions.body).toHaveProperty('sessions');
  const list = sessions.body.sessions;
    expect(Array.isArray(list)).toBe(true);
    // at least one session should include our deviceName
    const found = list.find((s: any) => s.deviceName === deviceName);
    expect(found).toBeDefined();
  });
});
