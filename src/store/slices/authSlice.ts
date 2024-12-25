import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../types/auth.types';

interface AuthState {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

interface AuthCredentials {
    user: IUser;
    token: string;
}

const initialState: AuthState = {
    user: null,
    token: null,
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
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            } else {
                const { user, token } = action.payload;
                state.user = user;
                state.token = token;
                state.isAuthenticated = true;
                state.loading = false;
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
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        }
    }
});

export const { setCredentials, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;