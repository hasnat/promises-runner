module.exports = class PromisesRunner {
    constructor({
                    objectsArrayWithPromises = [],
                    inputData = {},
                    outputDataKey = false,
                    mergePromiseOutputToNextPromiseInput = false
                }) {
        this.inputData = inputData;
        this.outputData = {};
        this.outputDataKey = outputDataKey;
        this.mainPromises = objectsArrayWithPromises;
        this.mergeInput = mergePromiseOutputToNextPromiseInput;
    }

    static ensurePromise(isThisPromise) {
        return isThisPromise && typeof isThisPromise.then === 'function' ? isThisPromise : Promise.resolve(isThisPromise);
    }

    resolvePromisesAndRunFollowing(parallelPromises, nextPromiseToRun) {
        return Promise.all(parallelPromises)
            .then(results => {
                this.outputData = Object.assign({}, this.outputData, ...results);

                return PromisesRunner.ensurePromise(nextPromiseToRun(this.inputForPromise()))
            })
    }

    inputForPromise() {
        if (this.mergeInput) {
            return Object.assign({}, this.inputData, this.getOutputData())
        }

        return this.inputData;
    }

    getOutputData() {
        return this.outputDataKey ? {[this.outputDataKey]: this.outputData} : this.outputData;
    }

    start() {
        return this.runSetOfPromisesFrom()
            .then(result => Promise.resolve(this.getOutputData()));
    }

    runSetOfPromisesFrom(startIndex = 0) {

        const parallelPromises = [];
        parallelPromises.push(Promise.resolve({}));

        for (let i = startIndex; i < this.mainPromises.length; i++) {
            const promiseToRun = this.mainPromises[i];
            if (promiseToRun.wait) {
                return this.resolvePromisesAndRunFollowing(parallelPromises, promiseToRun.promise)
                    .then(val => {
                        this.outputData = Object.assign({}, this.outputData, val);
                        return this.runSetOfPromisesFrom(i + 1);
                    });
            } else {
                parallelPromises.push(
                    this.resolvePromisesAndRunFollowing([
                        PromisesRunner.ensurePromise(promiseToRun.promise(this.inputForPromise()))
                    ], f => ({}))
                );
            }
        }

        return this.resolvePromisesAndRunFollowing(parallelPromises, f => ({}));
    }
}
