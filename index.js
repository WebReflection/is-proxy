import pony from './pony.js';

let { Proxy } = globalThis;

if (!('isProxy' in Proxy)) {
  Proxy = pony(Proxy);
  Reflect.defineProperty(globalThis, 'Proxy', { value: Proxy });
}

export default /** @type {ProxyConstructor & { isProxy: (ref:object) => boolean }} */(Proxy);
