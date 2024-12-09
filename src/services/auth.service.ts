import { ILoginCredentials, IRegisterCredentials, IAuthResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL;
console.log("API_URL", API_URL);
export const AuthService = {
    async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Login failed');
        }
    },

    async register(credentials: IRegisterCredentials): Promise<IAuthResponse> {
        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Registration failed');
        }
    },

    logout(): void {
        // No need to handle localStorage here
    }
};