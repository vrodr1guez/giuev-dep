// Fix React import issues for CommonJS and ESM
declare module "react" {
  const React: any;
  export = React;
  export as namespace React;
  
  // Core React types
  export type ReactNode = any;
  export type ReactElement = any;
  export type RefObject<T> = { current: T | null };
  export type ForwardedRef<T> = RefObject<T> | ((instance: T | null) => void) | null;
  export type CSSProperties = any;
  export type ComponentType<P = any> = any;
  export type ElementType = string | any;
  export type ButtonHTMLAttributes<T> = any;
  
  // React hooks
  export const useState: any;
  export const useEffect: any;
  export const useCallback: any;
  export const useContext: any;
  export const createContext: any;
  export const useRef: any;
  export const useMemo: any;
  export const useReducer: any;
  
  // Component-related functions
  export const forwardRef: any;
  export const createElement: any;
  export const Fragment: any;
  export const cloneElement: any;
  export const memo: any;
  export const isValidElement: any;
  export const createPortal: any;
  
  // Utilities
  export namespace Children {
    export const map: any;
    export const forEach: any;
    export const count: any;
    export const only: any;
    export const toArray: any;
  }
}

// Types for store
declare interface RootState {
  vehicles: {
    items: any[];
    loading: boolean;
    error: string | null;
    selectedVehicleId?: string;
  };
  charging: {
    stations: any[];
    filters: any;
    loading: boolean;
    error: string | null;
  };
}

// Fix module import issues
declare module "@/store" {
  export const store: any;
  export type RootState = any;
  export type AppDispatch = any;
}

// Add missing icons 
declare module "lucide-react" {
  // Create a base type for icon components
  type IconComponent = React.FC<{ 
    className?: string;
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;

  // List all used icons
  export const Activity: IconComponent;
  export const AlertCircle: IconComponent;
  export const AlertOctagon: IconComponent;
  export const AlertTriangle: IconComponent;
  export const ArrowDown: IconComponent;
  export const ArrowRight: IconComponent;
  export const ArrowUp: IconComponent;
  export const Award: IconComponent;
  export const BarChart: IconComponent;
  export const BarChart2: IconComponent;
  export const Battery: IconComponent;
  export const BatteryCharging: IconComponent;
  export const Bell: IconComponent;
  export const BellRing: IconComponent;
  export const Bolt: IconComponent;
  export const BrainCircuit: IconComponent;
  export const Calendar: IconComponent;
  export const CalendarPlus: IconComponent;
  export const Car: IconComponent;
  export const Check: IconComponent;
  export const CheckCircle: IconComponent;
  export const CheckCircle2: IconComponent;
  export const CheckSquare: IconComponent;
  export const ChevronDown: IconComponent;
  export const ChevronLeft: IconComponent;
  export const ChevronRight: IconComponent;
  export const Circle: IconComponent;
  export const Clock: IconComponent;
  export const Cloud: IconComponent;
  export const CloudLightning: IconComponent;
  export const Compass: IconComponent;
  export const CornerUpRight: IconComponent;
  export const Cpu: IconComponent;
  export const Database: IconComponent;
  export const DollarSign: IconComponent;
  export const Download: IconComponent;
  export const Droplets: IconComponent;
  export const Edit: IconComponent;
  export const ExternalLink: IconComponent;
  export const FileBarChart: IconComponent;
  export const FileText: IconComponent;
  export const Filter: IconComponent;
  export const Gauge: IconComponent;
  export const Globe: IconComponent;
  export const History: IconComponent;
  export const Home: IconComponent;
  export const Info: IconComponent;
  export const Key: IconComponent;
  export const Layout: IconComponent;
  export const LayoutDashboard: IconComponent;
  export const LayoutGrid: IconComponent;
  export const Layers: IconComponent;
  export const Leaf: IconComponent;
  export const LineChart: IconComponent;
  export const List: IconComponent;
  export const ListFilter: IconComponent;
  export const Loader: IconComponent;
  export const Map: IconComponent;
  export const MapPin: IconComponent;
  export const Maximize2: IconComponent;
  export const Menu: IconComponent;
  export const MessageSquare: IconComponent;
  export const Minus: IconComponent;
  export const Moon: IconComponent;
  export const MoreHorizontal: IconComponent;
  export const Navigation: IconComponent;
  export const PieChart: IconComponent;
  export const Plus: IconComponent;
  export const PlusCircle: IconComponent;
  export const PlugZap: IconComponent;
  export const Power: IconComponent;
  export const RefreshCw: IconComponent;
  export const Route: IconComponent;
  export const Save: IconComponent;
  export const Search: IconComponent;
  export const Server: IconComponent;
  export const Settings: IconComponent;
  export const Shield: IconComponent;
  export const Sliders: IconComponent;
  export const Smartphone: IconComponent;
  export const Snowflake: IconComponent;
  export const Sparkles: IconComponent;
  export const Sun: IconComponent;
  export const Table: IconComponent;
  export const ThermometerSun: IconComponent;
  export const Trash: IconComponent;
  export const TrendingDown: IconComponent;
  export const TrendingUp: IconComponent;
  export const Upload: IconComponent;
  export const User: IconComponent;
  export const UserPlus: IconComponent;
  export const Users: IconComponent;
  export const WifiOff: IconComponent;
  export const Wind: IconComponent;
  export const Wrench: IconComponent;
  export const X: IconComponent;
  export const Zap: IconComponent;
}

// Fix Leaflet type issues
declare module 'leaflet' {
  export interface Icon {
    Default: {
      prototype: {
        _getIconUrl?: any;
      };
      mergeOptions: (options: any) => void;
    };
  }
  
  export function map(element: string | HTMLElement, options?: any): any;
  export function tileLayer(url: string, options?: any): any;
  export function marker(latLng: [number, number], options?: any): any;
  export function divIcon(options?: any): any;
  
  export const Icon: Icon;
}

// Type definitions for unknown request objects
declare global {
  interface RoutePlanningRequest {
    vehicleId: string;
    originLatitude: number;
    originLongitude: number;
    destinationLatitude: number;
    destinationLongitude: number;
    currentSocPercent?: number;
    departureTime?: Date;
  }

  interface V2GFeasibilityRequest {
    vehicleId: string;
    minSocAfterDischargePercent?: number;
    targetEnergyToDischargeKwh?: number;
  }

  interface V2GDispatchSchedule {
    vehicleId: string;
    [key: string]: any;
  }

  interface PaymentMethod {
    token: {
      length: number;
    };
  }
} 