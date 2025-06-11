import { Middleware } from '../../types/redux-toolkit';

export const rtkQueryErrorLogger: Middleware = api => next => action => {
  // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood
  // so we can detect unsuccessful requests by checking for rejected actions
  if (action.type?.endsWith('/rejected')) {
    console.error('API Error:', action.error);
  }
  
  return next(action);
}; 