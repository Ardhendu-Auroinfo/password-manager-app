/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*************************************!*\
  !*** ./src/extension/background.ts ***!
  \*************************************/
__webpack_require__.r(__webpack_exports__);
chrome.runtime.onInstalled.addListener(function () {
    console.log('Extension installed');
});
// Listen for messages from web app and content scripts
chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
    console.log('Received external message:', message, 'from:', sender);
    if (message.type === 'SAVE_AUTH_DATA') {
        // Save auth data to extension storage
        chrome.storage.local.set({ auth: message.payload }, function () {
            if (chrome.runtime.lastError) {
                console.error('Error saving auth data:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError });
            }
            else {
                console.log('Auth data saved successfully');
                // Notify popup about the auth state change
                chrome.runtime.sendMessage({
                    type: 'AUTH_STATE_CHANGED',
                    payload: message.payload
                });
                sendResponse({ success: true });
            }
        });
    }
    if (message.type === 'CLEAR_AUTH_DATA') {
        // Clear auth data from extension storage
        chrome.storage.local.remove('auth', function () {
            if (chrome.runtime.lastError) {
                console.error('Error clearing auth data:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError });
            }
            else {
                console.log('Auth data cleared successfully');
                // Notify popup about the auth state change
                chrome.runtime.sendMessage({
                    type: 'AUTH_STATE_CHANGED',
                    payload: null
                });
                sendResponse({ success: true });
            }
        });
    }
    // Required for async sendResponse
    return true;
});
// Listen for internal messages
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log('Received internal message:', message);
    if (message.type === 'AUTH_STATE_CHANGED') {
        chrome.storage.local.set({ auth: message.payload }, function () {
            if (chrome.runtime.lastError) {
                console.error('Error saving auth state:', chrome.runtime.lastError);
            }
            else {
                console.log('Auth state updated in storage');
            }
        });
    }
    return true;
});

// Handle authentication and other background tasks

/******/ })()
;
//# sourceMappingURL=background.js.map