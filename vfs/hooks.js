const listeners = {
    before: {
        readdir: []
    }
};

function before(name, listener) {
    listeners.before[name].push(listener);

    return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
            listeners.splice(index, 1);
        } else {
            throw new Error('Listener not found');
        }
    }
}

function trigger(phase, name, context, ...args) {
    for (let listener of listeners[phase][name]) {
        listener({ phase, name, ...context }, ...args);
    }
}

module.exports = {
    before,
    trigger
};
