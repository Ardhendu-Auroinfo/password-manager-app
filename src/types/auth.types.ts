export interface ILoginCredentials {
    email: string;
    password: string;
}

export interface IRegisterCredentials extends ILoginCredentials {
    confirmPassword: string;
    masterPasswordHint?: string;
}

export interface IAuthResponse {
    success: boolean;
    message?: string;
    data?: {
        user: IUser;
        token: string;
    };
}

export interface IAuthError {
    message: string;
    field?: string;
}

export interface IUser {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}