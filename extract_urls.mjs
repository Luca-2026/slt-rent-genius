import { createServer } from 'vite';
import path from 'path';

const server = await createServer({
  root: '/dev-server',
  configFile: path.resolve('/dev-server/vite.config.ts'),
  server: { middlewareMode: true },
});

const mod = await server.ssrLoadModule('/dev-server/src/data/rentalData.ts');
const locations = mod.locations;

const urls = [];
for (const loc of locations) {
  for (const [catId, products] of Object.entries(loc.products)) {
    for (const product of products) {
      urls.push(`/mieten/${loc.id}/${catId}/${product.id}`);
    }
  }
}

console.log(JSON.stringify(urls));
await server.close();
