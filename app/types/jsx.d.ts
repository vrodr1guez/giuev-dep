/// <reference types="react" />

import React from 'react';

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): JSX.Element | null;
    }
    interface IntrinsicElements {
      // Main elements
      div: any;
      span: any;
      p: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      h5: any;
      h6: any;
      button: any;
      a: any;
      ul: any;
      li: any;
      
      // Form elements
      form: any;
      input: any;
      select: any;
      option: any;
      textarea: any;
      label: any;
      
      // Table elements
      table: any;
      thead: any;
      tbody: any;
      tr: any;
      th: any;
      td: any;
      
      // Other common elements
      img: any;
      svg: any;
      path: any;
      canvas: any;
      nav: any;
      header: any;
      footer: any;
      main: any;
      section: any;
      article: any;
      aside: any;
      
      // Less common elements
      blockquote: any;
      code: any;
      pre: any;
      hr: any;
      br: any;
      i: any;
      b: any;
      strong: any;
      em: any;
      
      // Custom elements (these could be your app-specific components)
      Card: any;
      CardHeader: any;
      CardContent: any;
      CardTitle: any;
      Link: any;
      StatusSelect: any;
      
      // Generic fallback for all other elements
      [key: string]: any;
    }
  }
} 