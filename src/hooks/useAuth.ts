import { useAppDispatch, useAppSelector } from './useRedux';
import { AuthService } from '../services/auth.service';
import { setCredentials, logout } from '../store/slices/authSlice';
import { ILoginCredentials, IRegisterCredentials } from '../types/auth.types';
import { generateMasterKey } from '../utils/encryption';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, token, masterKey, loading, error, isAuthenticated } = useAppSelector(
        (state) => state.auth
    );

    const login = async (credentials: ILoginCredentials) => {
        try {
            const response = await AuthService.login(credentials);
            
            if (response.success && response.data) {
                const masterKey = generateMasterKey(
                    credentials.password,
                    response.data.user.email
                );

                dispatch(setCredentials({
                    user: response.data.user,
                    token: response.data.token,
                    masterKey
                }));

                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (credentials: IRegisterCredentials) => {
        try {
            const response = await AuthService.register(credentials);
            
            if (response.success) {
                return await login({
                    email: credentials.email,
                    password: credentials.password
                });
            }
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const logoutUser = () => {
        dispatch(logout());
        AuthService.logout();
    };

    return {
        user,
        token,
        masterKey,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout: logoutUser
    };
};