module.exports = function (transformedCode) {

    return ` \
let _hmrUpdateHandler;

export function onHmrUpdate(hmrUpdateHandler) {

    _hmrUpdateHandler = hmrUpdateHandler;
}

import.meta.hot.accept(module => _hmrUpdateHandler(module));

export default ${JSON.stringify(transformedCode)}
`
}
