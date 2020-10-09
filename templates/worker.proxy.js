module.exports = function ({ workerFileName }) {

    return `import { wrap } from 'comlink';

export default class WorkerProxy {
    constructor() {
        this.worker = new Worker('${workerFileName}', { type: 'module' });
        this.wrappedWorker = wrap(this.worker);

        return this.wrappedWorker;
    }
}`;
}
