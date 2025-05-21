/**
 * @param {ProxyConstructor} Proxy the proxy constructor to patch.
 * @param {Symbol} [target] a "secret" to retrieve a callback that reveals proxies' targets.
 * @returns {ProxyConstructor & { isProxy: (ref:object) => boolean }}
 */
export default (Proxy, target = Symbol.for('is-proxy')) => {
  const { apply, construct, has, get, ownKeys } = Reflect;
  const { revocable } = Proxy;
  const isProxy = 'isProxy';
  const proxies = new WeakMap;
  const getProxy = proxies.get.bind(proxies);
  const hasProxy = proxies.has.bind(proxies);
  const setProxy = proxies.set.bind(proxies);
  const named = {
    revocable(...args) {
      const target = apply(revocable, this, args);
      setProxy(target.proxy, args[0]);
      return target;
    }
  };
  return isProxy in Proxy ? Proxy : new Proxy(Proxy, {
    construct: (Proxy, args, New) => {
      const proxy = construct(Proxy, args, New);
      setProxy(proxy, args[0]);
      return proxy;
    },
    has: (Proxy, key) => key === isProxy || has(Proxy, key),
    get: (Proxy, key, receiver) => {
      if (key === isProxy) return hasProxy;
      if (key === 'revocable') return named.revocable;
      return key === target ? getProxy : get(Proxy, key, receiver);
    },
    ownKeys: Proxy => {
      const keys = ownKeys(Proxy);
      keys.push(isProxy);
      return keys;
    },
  });
};
