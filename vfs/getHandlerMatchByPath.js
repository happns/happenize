const handlers = require('./handlers');

module.exports = (path, context) => {
    const test = (handler, path) => {

        if (typeof handler.test === 'function') {
            return handler.test(path, context);
        } else if (handler.test.constructor === RegExp) {
            return path.match(handler.test)
        }

        throw new Error(`The "test" property of a vfs handler should be either a RegExp or function, received ${handler.test}`);
    };

    const handlerMatchList = handlers.map(handler => ({ handler: handler, match: test(handler, path) })).filter(handler => handler.match);

    const firstOrUndefined = result => result ? result[0] : undefined;

    const hasMatchPromises = handlerMatchList.some(({ match }) => match.then);
    if (hasMatchPromises) {
        const handlerMatchListPromise = Promise.all(
            handlerMatchList
                .map(async ({ handler, match }) => ({ handler, match: await match }))
        ).then(handlerMatchList => handlerMatchList.filter(handler => handler.match));

        return handlerMatchListPromise.then(handlerMatchList => firstOrUndefined(handlerMatchList));
    }

    return firstOrUndefined(handlerMatchList);
};
