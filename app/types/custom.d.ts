// This file contains custom type declarations for the project

// SVG declarations
declare namespace JSX {
  interface IntrinsicElements {
    svg: React.SVGProps<SVGSVGElement>;
    path: React.SVGProps<SVGPathElement>;
    circle: React.SVGProps<SVGCircleElement>;
    rect: React.SVGProps<SVGRectElement>;
    line: React.SVGProps<SVGLineElement>;
    polyline: React.SVGProps<SVGPolylineElement>;
    polygon: React.SVGProps<SVGPolygonElement>;
    g: React.SVGProps<SVGGElement>;
    defs: React.SVGProps<SVGDefsElement>;
    stop: React.SVGProps<SVGStopElement>;
    linearGradient: React.SVGProps<SVGLinearGradientElement>;
    radialGradient: React.SVGProps<SVGRadialGradientElement>;
    mask: React.SVGProps<SVGMaskElement>;
    pattern: React.SVGProps<SVGPatternElement>;
    clipPath: React.SVGProps<SVGClipPathElement>;
    text: React.SVGProps<SVGTextElement>;
    tspan: React.SVGProps<SVGTSpanElement>;
    image: React.SVGProps<SVGImageElement>;
    foreignObject: React.SVGProps<SVGForeignObjectElement>;
  }
} 