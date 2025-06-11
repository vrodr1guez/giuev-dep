// Node.js environment globals
declare var __dirname: string;
declare var __filename: string;
declare var require: any;
// Avoid direct module assignment - use a namespace instead
declare namespace NodeJS {
    interface Module {
        exports: any;
        require(id: string): any;
        id: string;
        filename: string;
        loaded: boolean;
        parent: any;
        children: any[];
    }
}

// Node.js process
declare namespace NodeJS {
    interface Process {
        env: Record<string, string | undefined>;
        cwd(): string;
        argv: string[];
        versions: Record<string, string>;
        platform: string;
        exit(code?: number): never;
    }
}

declare var process: NodeJS.Process;

// Node.js path module
declare module 'path' {
    export function join(...paths: string[]): string;
    export function resolve(...paths: string[]): string;
    export function normalize(path: string): string;
    export function dirname(path: string): string;
    export function basename(path: string, ext?: string): string;
    export function extname(path: string): string;
    export function isAbsolute(path: string): boolean;
    export function relative(from: string, to: string): string;
    export const sep: string;
    export const delimiter: string;
} 