// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

type Store = {
    [key: string]: unknown;
}

let localStorageMock = (function() {
    let store: Store = {};
    return {
        getItem: function(key: string): unknown {
            return store[key] || null;
        },
        setItem: function(key: string, value: unknown) {
            store[key] = String(value);
        },
        isMock: function(): boolean {
            return true;
        },
        clear: function() {
            store = {};
        },
        removeItem: function(key: string) {
            delete store[key];
        }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

