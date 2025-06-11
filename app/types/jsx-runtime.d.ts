declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface Element {
      // Empty interface just to exist
    }
  }
  
  export function jsx(
    type: any,
    props: any,
    key?: string | number | null
  ): JSX.Element;
  
  export function jsxs(
    type: any,
    props: any,
    key?: string | number | null
  ): JSX.Element;
} 