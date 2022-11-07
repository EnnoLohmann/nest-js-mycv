import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@test.de', password: 'Test1234' })
      .expect(201)
      .then((response) => {
        const { email, id } = response.body;
        expect(id).toBeDefined();
        expect(email).toEqual('test@test.de');
      });
  });

  it('signup as a new user then get the currently logged in user', async () => {
    const email = 'test2@test.de';

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'Test1234' })
      .expect(201);

    const cookie = response.get('Set-Cookie');
    const { body: user } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);
    expect(user.email).toEqual(email);
  });
});
