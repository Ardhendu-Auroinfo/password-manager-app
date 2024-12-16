import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import authReducer from './slices/authSlice';
// import vaultReducer from './slices/vaultSlice';

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'token', 'masterKey', 'isAuthenticated'] // only persist these fields
};

const rootReducer = {
    auth: persistReducer(authPersistConfig, authReducer),
    // vault: vaultReducer // vault data doesn't need to be persisted
};

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;