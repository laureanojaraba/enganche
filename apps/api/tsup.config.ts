import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node24',
  clean: true,
  // shared se consume como TypeScript: se incluye en el bundle.
  noExternal: ['@ladiez/shared'],
});
