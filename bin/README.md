# Build Scripts

This directory contains build and utility scripts for the EV Charging Infrastructure application.

## Available Scripts

### `build.js`

This script uses esbuild to bundle the server-side application code.

Usage:
```bash
npm run build:server
```

### `install-esbuild.js`

This script installs the necessary esbuild dependencies if they are missing.

Usage:
```bash
npm run setup:esbuild
```

## Troubleshooting

If you encounter esbuild-related errors, try running the setup script first:

```bash
npm run setup:esbuild
```

This will ensure all necessary dependencies are installed correctly.

## Build Configuration

The build configuration is set in the `build.js` file. It's configured to:

- Use TypeScript and React/JSX
- Bundle for Node.js environment
- Exclude node_modules (using esbuild-node-externals)
- Generate sourcemaps in development mode
- Minify output in production mode

To modify the build configuration, edit the `build.js` file. 