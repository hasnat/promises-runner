const ensureArray = (arr) => arr === undefined ? [] : Array.isArray(arr) ? arr : [arr];

const mergeSimilar = (currentData, newData) => ensureArray(currentData).concat([newData]);

const ensurePromise = (isThisPromise) => (
    isThisPromise && typeof isThisPromise.then === 'function' ? isThisPromise : Promise.resolve(isThisPromise)
)
const mergeObjectCreatingArraysForSameKeys = (existingData, newData) => {
    newData = ensureArray(newData)
    for (let i = 0, len = newData.length; i < len; i++) {
        const data = newData[i];
        Object.keys(data).map(key => {
            if (existingData[key] !== undefined) {
                existingData[key] = mergeSimilar(existingData[key], data[key]);
            } else {
                existingData[key] = data[key];
            }
        })
    }
    return existingData;
}
module.exports = class PromisesRunner {
    constructor({
        objectsArrayWithPromises = [],
        inputData = {},
        outputDataKey = false,
        mergePromiseOutputToNextPromiseInput = false,
        mergeSameKeyByConvertingToArray = false,
        logger = false
    }) {
        this.inputData = inputData;
        this.outputData = {};
        this.outputDataKey = outputDataKey;
        this.mainPromises = objectsArrayWithPromises;
        this.mergeInput = mergePromiseOutputToNextPromiseInput;
        this.mergeOutputSpecial = mergeSameKeyByConvertingToArray;
        this.logger = logger;
        if (typeof this.logger === 'function') {
            this.mainPromises = objectsArrayWithPromises.map(obj => {
                const promiseToRun = obj.promise;
                obj.promiseName = promiseToRun.name;
                obj.promise = input => {
                    this.logger('START', obj, input);
                    return promiseToRun(input)
                        .then((out) => {
                            this.logger('DONE', obj, out);
                            return Promise.resolve(out);
                        })
                        .catch((err) => {
                            this.logger('ERROR', obj, err);
                            throw err;
                        });
                };
                return obj;
            })
        }
    }

    resolvePromisesAndRunFollowing(parallelPromises, nextPromiseToRun, outputKey) {
        return Promise.all(parallelPromises)
            .then(results => {
                if (this.mergeOutputSpecial) {
                    this.outputData = mergeObjectCreatingArraysForSameKeys(this.outputData, results)
                } else {
                    this.outputData = Object.assign({}, this.outputData, ...results);
                }

                return ensurePromise(nextPromiseToRun(this.inputForPromise()))
                    .then(result => Promise.resolve(outputKey !== undefined ? {[outputKey]: result} : result))
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
            const {wait, promise, outputKey} = promiseToRun;
            if (wait) {
                return this.resolvePromisesAndRunFollowing(parallelPromises, promise, outputKey)
                    .then(val => {
                        if (this.mergeOutputSpecial) {
                            this.outputData = mergeObjectCreatingArraysForSameKeys(this.outputData, val)
                        } else {
                            this.outputData = Object.assign({}, this.outputData, val);
                        }

                        return this.runSetOfPromisesFrom(i + 1);
                    });
            } else {

                parallelPromises.push(
                    this.resolvePromisesAndRunFollowing([
                        ensurePromise(promise(this.inputForPromise()))
                            .then(result => Promise.resolve(outputKey !== undefined ? {[outputKey]: result} : result))
                    ], f => ({}))
                );
            }
        }

        return this.resolvePromisesAndRunFollowing(parallelPromises, f => ({}));
    }
}
