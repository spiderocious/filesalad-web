import { http, HttpResponse } from 'msw';

import { ENV } from '@shared/config/env';
import { EP } from '@shared/constants/endpoints';

const base = `${ENV.API_BASE_URL}/api/v1`;
// The presigned PUT target the presign handler returns — also stubbed so the
// upload flow's direct-to-storage step resolves in tests.
export const STORAGE_URL = 'https://storage.test/f_test.png?sig=abc';

export const handlers = [
  http.get(`${base}${EP.WEB.USAGE}`, () =>
    HttpResponse.json({ data: { used: 1, limit: 50, remaining: 49 } }),
  ),

  http.post(`${base}${EP.WEB.PRESIGN}`, () =>
    HttpResponse.json(
      {
        data: {
          upload_id: 'up_test',
          key: 'f_test.png',
          upload_url: STORAGE_URL,
          public_url: 'https://files.example.com/f_test.png',
          public_url_expires_at: '2099-01-01T00:00:00Z',
          remaining: 48,
        },
      },
      { status: 201 },
    ),
  ),

  // Fresh download URL (used when a cached URL is expired).
  http.get(`${base}${EP.WEB.DOWNLOAD('up_test')}`, () =>
    HttpResponse.json({
      data: {
        download_url: 'https://files.example.com/fresh.png?sig=new',
        expires_in: 7200,
        expires_at: '2099-01-01T02:00:00Z',
      },
    }),
  ),

  http.put(STORAGE_URL, () => new HttpResponse(null, { status: 200 })),
];
