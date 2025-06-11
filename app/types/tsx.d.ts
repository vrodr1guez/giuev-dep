// TypeScript JSX declarations
declare namespace React {
  interface DOMAttributes<T> {
    children?: React.ReactNode;
    dangerouslySetInnerHTML?: {
      __html: string;
    };
    
    // Events
    onClick?: any;
    onChange?: any;
    onSubmit?: any;
    onKeyPress?: any;
    onKeyDown?: any;
    onKeyUp?: any;
    onBlur?: any;
    onFocus?: any;
    onMouseEnter?: any;
    onMouseLeave?: any;
  }

  interface HTMLAttributes<T> extends DOMAttributes<T> {
    // Standard HTML Attributes
    className?: string;
    id?: string;
    style?: any;
    role?: string;
    tabIndex?: number;
    title?: string;
    
    // HTML5 data attributes
    [dataAttr: `data-${string}`]: any;
    
    // ARIA attributes
    [ariaAttr: `aria-${string}`]: any;
    
    // Common TypeScript HTML props
    key?: any;
    ref?: any;
  }

  interface AllHTMLAttributes extends HTMLAttributes<any> {
    // Form attributes
    type?: string;
    value?: any;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    checked?: boolean;
    readOnly?: boolean;
    required?: boolean;
    defaultValue?: any;
    
    // Hyperlink attributes
    href?: string;
    target?: string;
    rel?: string;
    
    // Image attributes
    src?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    
    // Table attributes
    colSpan?: number;
    rowSpan?: number;
    
    // Various attributes
    autoComplete?: string;
    autoFocus?: boolean;
    draggable?: boolean;
    spellCheck?: boolean;
    
    // Tailwind CSS attributes commonly used
    // These are just the className string but helpful to type
    // for clarity on what's being used in the app
    className?: string;
  }
}

// Import the existing JSX namespace (which might have IntrinsicElements)
/// <reference path="./jsx.d.ts" /> 