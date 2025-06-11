// Type definitions for redux-toolkit
export interface Action<T = any> {
  type: T;
}

export interface AnyAction extends Action {
  // Allows any extra properties to be defined in an action.
  [extraProps: string]: any;
}

export interface PayloadAction<P = void, T extends string = string, M = never, E = never> extends Action<T> {
  payload: P;
  meta: M;
  error: E;
}

export interface Reducer<S = any, A extends Action = AnyAction> {
  (state: S | undefined, action: A): S;
}

export interface Slice<State, CaseReducers, Name extends string = string> {
  name: Name;
  reducer: Reducer<State>;
  actions: Record<string, (...args: any[]) => any>;
  caseReducers: CaseReducers;
}

export interface ActionCreatorWithPreparedPayload<Args extends unknown[], P, T extends string = string, M = never, E = never> {
  (...args: Args): PayloadAction<P, T, M, E>;
}

export interface Middleware {
  (api: MiddlewareAPI): (next: Dispatch) => (action: any) => any;
}

export interface MiddlewareAPI {
  dispatch: Dispatch;
  getState: () => any;
}

export interface Dispatch<A extends Action = AnyAction> {
  <T extends A>(action: T): T;
}

export function createSlice<State, CaseReducers, Name extends string = string>(options: {
  name: Name;
  initialState: State;
  reducers: CaseReducers;
}): Slice<State, CaseReducers, Name> {
  return {} as any;
}

export function configureStore<S = any, A extends Action = AnyAction>(options: {
  reducer: Reducer<S, A> | Record<string, Reducer<any, any>>;
  middleware?: any;
  devTools?: boolean;
  preloadedState?: Partial<S>;
  enhancers?: any[];
}): any {
  return {} as any;
} 