import http from 'http';

const options = {
  method: 'OPTIONS',
  hostname: 'localhost',
  port: 3001,
  path: '/auth/refresh',
  headers: {
    Origin: 'http://localhost:3002',
    'Access-Control-Request-Method': 'POST'
  }
};

const req = http.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:');
  console.log(res.headers);
  res.on('data', () => {});
  res.on('end', () => process.exit(0));
});

req.on('error', (err) => {
  console.error('request error', err.message);
  process.exit(1);
});

req.end();
