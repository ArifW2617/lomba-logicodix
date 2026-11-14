import express, { type Request, type Response } from 'express';
import { apiRouter } from '../src/apiRouter.js';

const app = express();
app.use('/api', apiRouter);

export default function handler(req: Request, res: Response) {
  const requestUrl = req.url || '/';
  if (!requestUrl.startsWith('/api/')) {
    req.url = `/api${requestUrl.startsWith('/') ? requestUrl : `/${requestUrl}`}`;
  }

  return app(req, res);
}
