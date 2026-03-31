import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Callback, VercelRequest, VercelResponse } from '@vercel/node';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

export default async function handler(req: VercelRequest, res: VercelResponse, callback: Callback) {
  const server = await bootstrap();
  server(req, res);
}
