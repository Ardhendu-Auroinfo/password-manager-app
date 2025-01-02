export interface ILoginCredentials {
    email: string;
    password: string;
}

export interface IRegisterCredentials extends ILoginCredentials {
    confirmPassword: string;
    masterPasswordHint?: string;
}

export interface IUser {
    id: string;
    email: string;
    created_at?: string;
}

export interface IAuthResponse {
    success: boolean;
    message?: string;
    data?: {
        token: string;
        user: IUser;
        encryptedVaultKey: string;
    };
}
export interface IErrorResponse {
    success: boolean;
    error: string; // Or whatever structure your error response has
}
export interface IAuthError {
    message: string;
    field: string;
}