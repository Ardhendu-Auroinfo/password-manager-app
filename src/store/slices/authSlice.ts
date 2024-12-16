import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../types/auth.types';
import { REHYDRATE } from 'redux-persist';

interface AuthState {
    user: IUser | null;
    token: string | null;
    masterKey: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

interface AuthCredentials {
    user: IUser;
    token: string;
    masterKey: string;
}

// Define RehydrateAction type
interface RehydrateAction {
    type: typeof REHYDRATE;
    key: string;
    payload?: {
        auth?: AuthState;
    };
}

const initialState: AuthState = {
    user: null,
    token: null,
    masterKey: null,
    isAuthenticated: false,
    loading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<AuthCredentials | null>
        ) => {
            if (action.payload === null) {
                // Reset to initial state when payload is null
                state.user = null;
                state.token = null;
                state.masterKey = null;
                state.isAuthenticated = false;
                state.error = null;
            } else {
                const { user, token, masterKey } = action.payload;
                state.user = user;
                state.token = token;
                state.masterKey = masterKey;
                state.isAuthenticated = true;
                state.error = null;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        logout: (state) => {
            // Reset to initial state
            state.user = null;
            state.token = null;
            state.masterKey = null;
            state.isAuthenticated = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
            if (action.payload?.auth) {
                return {
                    ...state,
                    ...action.payload.auth,
                    loading: false
                };
            }
            return state;
        });
    }
});

export const { setCredentials, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;