import rawApp from '../server/src/app';

// Gracefully resolve default export across CJS / ESM module interop
const app = typeof rawApp === 'function' ? rawApp : (rawApp as any).default || rawApp;

export default function handler(req: any, res: any) {
  return app(req, res);
}

