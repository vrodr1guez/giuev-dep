#!/usr/bin/env node

const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');
const { join } = require('path');

const isProd = process.env.NODE_ENV === 'production';

async function build() {
  try {
    const result = await esbuild.build({
      entryPoints: ['app/index.ts'],
      bundle: true,
      minify: isProd,
      platform: 'node',
      target: ['node16'],
      outdir: 'dist',
      sourcemap: !isProd,
      plugins: [nodeExternalsPlugin()],
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      },
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'js',
        '.jsx': 'jsx',
        '.json': 'json',
      },
    });
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 