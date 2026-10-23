import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import http from 'http';
import { PassThrough } from 'stream';

describe('ProxyService', () => {
  let service: ProxyService;
  let mockServer: http.Server;
  let targetPort: number;

  beforeAll((done) => {
    mockServer = http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Custom-Echo', 'received');
        res.writeHead(200);
        res.end(
          JSON.stringify({
            receivedMethod: req.method,
            receivedUrl: req.url,
            receivedHeaders: req.headers,
            receivedBody: body ? JSON.parse(body) : null,
          }),
        );
      });
    });

    mockServer.listen(0, () => {
      const addr = mockServer.address();
      if (addr && typeof addr !== 'string') {
        targetPort = addr.port;
        process.env.AUTH_SVC_URL = `http://127.0.0.1:${targetPort}`;
      }
      done();
    });
  });

  afterAll((done) => {
    mockServer.close(done);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProxyService],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should forward request to auth-svc and pipe response', (done) => {
    const reqMock: any = {
      originalUrl: '/api/auth/login',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer dummy-token',
      },
      socket: { remoteAddress: '127.0.0.1' },
      body: { email: 'test@example.com', password: 'secretpassword' },
    };

    const resMock: any = new PassThrough();
    const resHeaders: Record<string, string> = {};
    resMock.headersSent = false;
    resMock.status = jest.fn().mockImplementation((code) => {
      resMock.statusCode = code;
      return resMock;
    });
    resMock.setHeader = jest.fn().mockImplementation((k, v) => {
      resHeaders[k.toLowerCase()] = v;
    });

    let responseData = '';
    resMock.on('data', (chunk: Buffer) => {
      responseData += chunk.toString();
    });

    resMock.on('finish', () => {
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resHeaders['x-custom-echo']).toBe('received');
      const parsed = JSON.parse(responseData);
      expect(parsed.receivedMethod).toBe('POST');
      expect(parsed.receivedUrl).toBe('/auth/login');
      expect(parsed.receivedBody.email).toBe('test@example.com');
      done();
    });

    service.forward(reqMock, resMock);
  });

  it('should rewrite /api/orgs to /orgs', (done) => {
    const reqMock: any = {
      originalUrl: '/api/orgs/123/members',
      method: 'GET',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      body: {},
    };

    const resMock: any = new PassThrough();
    resMock.headersSent = false;
    resMock.status = jest.fn().mockImplementation((code) => {
      resMock.statusCode = code;
      return resMock;
    });
    resMock.setHeader = jest.fn();

    let responseData = '';
    resMock.on('data', (chunk: Buffer) => {
      responseData += chunk.toString();
    });

    resMock.on('finish', () => {
      expect(resMock.status).toHaveBeenCalledWith(200);
      const parsed = JSON.parse(responseData);
      expect(parsed.receivedMethod).toBe('GET');
      expect(parsed.receivedUrl).toBe('/orgs/123/members');
      done();
    });

    service.forward(reqMock, resMock);
  });
});
