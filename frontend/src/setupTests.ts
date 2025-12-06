import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for react-router-dom
const globalAny = global as any;
if (typeof globalAny.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    globalAny.TextEncoder = TextEncoder;
    globalAny.TextDecoder = TextDecoder;
}
