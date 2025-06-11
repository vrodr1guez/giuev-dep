// Vite type definitions
declare module 'vite' {
  export interface UserConfig {
    plugins?: any[];
    resolve?: {
      alias?: Record<string, string>;
      dedupe?: string[];
      conditions?: string[];
      mainFields?: string[];
      extensions?: string[];
    };
    build?: any;
    server?: {
      port?: number;
      open?: boolean;
      proxy?: any;
      cors?: boolean | any;
      [key: string]: any;
    };
    css?: any;
    json?: any;
    esbuild?: any;
    optimizeDeps?: any;
    ssr?: any;
    base?: string;
    publicDir?: string;
    cacheDir?: string;
    mode?: string;
    define?: Record<string, any>;
    envDir?: string;
    envPrefix?: string | string[];
    [key: string]: any;
  }

  export function defineConfig(config: UserConfig): UserConfig;
}

// Vite React plugin
declare module '@vitejs/plugin-react' {
  export interface Options {
    include?: string | RegExp | Array<string | RegExp>;
    exclude?: string | RegExp | Array<string | RegExp>;
    jsxRuntime?: 'classic' | 'automatic';
    jsxImportSource?: string;
    babel?: any;
    [key: string]: any;
  }
  
  export default function react(options?: Options): {
    name: string;
    enforce: 'pre' | 'post';
    [key: string]: any;
  };
} 