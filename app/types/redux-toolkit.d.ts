export interface Action<T = any> {
  type: T;
}

export interface PayloadAction<P = void, T extends string = string> extends Action<T> {
  payload: P;
}

export type Reducer<S = any, A extends Action = Action> = (state: S | undefined, action: A) => S;

export interface SliceCaseReducers<State> {
  [K: string]: (state: State, action: PayloadAction<any>) => void | State;
}

export interface CreateSliceOptions<
  State = any,
  CR extends SliceCaseReducers<State> = SliceCaseReducers<State>
> {
  name: string;
  initialState: State;
  reducers: CR;
}

export interface Slice<State = any, CaseReducers extends SliceCaseReducers<State> = SliceCaseReducers<State>> {
  name: string;
  reducer: Reducer<State>;
  actions: { [K in keyof CaseReducers]: (...args: any[]) => PayloadAction<any> };
}

export function createSlice<State, CaseReducers extends SliceCaseReducers<State>>(
  options: CreateSliceOptions<State, CaseReducers>
): Slice<State, CaseReducers>; 