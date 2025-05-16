/**
 * @param {ProxyConstructor} Proxy
 * @returns {ProxyConstructor & { isProxy: (ref:object) => boolean }}
 */
export default Proxy => {
  const isProxy = 'isProxy';
  if (!(isProxy in Proxy)) {
    const { apply, construct, has, get, ownKeys } = Reflect;
    const { revocable } = Proxy;
    const named = {
      revocable(...args) {
        const target = apply(revocable, this, args);
        addProxy(target.proxy);
        return target;
      }
    };
    const proxies = new WeakSet;
    const addProxy = proxies.add.bind(proxies);
    const hasProxy = proxies.has.bind(proxies);
    Proxy = new Proxy(Proxy, {
      construct: (Proxy, args, New) => {
        const target = construct(Proxy, args, New);
        addProxy(target);
        return target;
      },
      has: (Proxy, key) => key === isProxy || has(Proxy, key),
      get: (Proxy, key, receiver) => {
        if (key === isProxy) return hasProxy;
        if (key === 'revocable') return named.revocable;
        return get(Proxy, key, receiver);
      },
      ownKeys: Proxy => [isProxy, ...ownKeys(Proxy)],
    });
  }
  return Proxy;
};
