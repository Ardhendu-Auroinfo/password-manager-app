export const config = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    EXTENSION_ID: process.env.REACT_APP_EXTENSION_ID || '',
    SECRET_KEY: process.env.REACT_APP_SECRET_KEY || '',
    APP_URL: process.env.APP_URL || 'http://localhost:3000'
};
