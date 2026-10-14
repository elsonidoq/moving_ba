import http from 'node:http';
import { fileURLToPath } from 'node:url';
import handler from 'serve-handler';

const raw = process.env.PORT;
if (raw !== undefined && (raw.trim() !== raw || !/^[0-9]+$/.test(raw) || !Number.isInteger(Number(raw)) || Number(raw) < 1 || Number(raw) > 65535)) {
  console.error('Invalid PORT: expected decimal integer 1..65535');
  process.exit(1);
}
const port = raw === undefined ? 3000 : Number(raw);
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const server = http.createServer((request, response) => handler(request, response, {
  public: root,
  directoryListing: false,
  renderSingle: false,
  symlinks: false,
  headers: [{ source: 'config/app-content.json', headers: [{ key: 'Cache-Control', value: 'no-store' }] }],
}));
server.on('error', error => { console.error(error); process.exit(1); });
server.listen(port, '0.0.0.0', () => console.log(`Listening on 0.0.0.0:${port}`));
process.on('SIGTERM', () => server.close());
