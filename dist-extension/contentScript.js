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
/*!****************************************!*\
  !*** ./src/extension/contentScript.ts ***!
  \****************************************/
__webpack_require__.r(__webpack_exports__);
console.log('Content script loaded');
var findLoginForm = function () {
    var usernameInput = document.querySelector('input[type="text"], input[type="email"]');
    var passwordInput = document.querySelector('input[type="password"]');
    return {
        usernameField: usernameInput,
        passwordField: passwordInput
    };
};
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'FILL_CREDENTIALS') {
        var _a = findLoginForm(), usernameField = _a.usernameField, passwordField = _a.passwordField;
        if (usernameField && passwordField) {
            usernameField.value = message.username;
            passwordField.value = message.password;
            usernameField.dispatchEvent(new Event('input', { bubbles: true }));
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            sendResponse({ success: true });
        }
        else {
            sendResponse({ success: false, error: 'Could not find login form' });
        }
    }
    return true;
});


/******/ })()
;
//# sourceMappingURL=contentScript.js.map