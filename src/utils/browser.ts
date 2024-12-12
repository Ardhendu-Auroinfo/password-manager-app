export const getBrowserAPI = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        // Extension context
        return require('webextension-polyfill-ts').browser;
    }
    return null;
};

export const isExtensionContext = (): boolean => {
    return !!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
};