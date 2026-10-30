import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  server: { host: '127.0.0.1', port: 4176, strictPort: true,
    proxy: { '/api/messages': {target:'http://127.0.0.1:4197',changeOrigin:true,headers:{Origin:'http://127.0.0.1:4197'}} },
  },
  preview: { host: '127.0.0.1', port: 4177, strictPort: true },
  build: { target: 'es2022' },
});
