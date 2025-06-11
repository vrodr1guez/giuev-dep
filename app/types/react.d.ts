// Extended React TypeScript definitions for missing types
import 'react';

declare module 'react' {
  export type FC<P = {}> = FunctionComponent<P>;
  export type FunctionComponent<P = {}> = (props: P) => ReactElement | null;
  export type ElementType = keyof JSX.IntrinsicElements | ((props: any) => ReactElement);
  export type ComponentProps<T extends ElementType> = T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : T extends (props: infer P) => any
    ? P
    : never;
  export type ElementRef<T extends ElementType> = T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T] extends React.DetailedHTMLProps<infer Props, infer Element>
      ? Element
      : never
    : T extends (props: any) => infer R
    ? R
    : never;
}
