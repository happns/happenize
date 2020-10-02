module.exports = (target, proxyOverlay) => {
    return new Proxy(target, {
        get(target, key) {
            if (proxyOverlay[key]) {
                return proxyOverlay[key];
            }

            return target[key];
        }
    });
}
