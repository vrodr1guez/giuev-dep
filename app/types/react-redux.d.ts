declare module 'react-redux' {
  import { ReactNode } from 'react';
  
  export interface TypedUseSelectorHook<TState> {
    <TSelected>(selector: (state: TState) => TSelected): TSelected;
  }

  export function useSelector<TState = any, TSelected = any>(
    selector: (state: TState) => TSelected
  ): TSelected;

  export function useDispatch<TDispatch = any>(): TDispatch;

  export interface ProviderProps<A = any> {
    store: A;
    children?: ReactNode;
  }

  export const Provider: React.ComponentType<ProviderProps>;
} 