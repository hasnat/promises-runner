module.exports = class PromisesRunner {
    constructor({objectsArrayWithPromises = [], data = {}}) {
        this.mainData = data;
        this.mainPromises = objectsArrayWithPromises;
    }

    static returnPromiseIfNotPromise(isThisPromise) {
        return isThisPromise && typeof isThisPromise.then === 'function' ? isThisPromise : Promise.resolve(isThisPromise);
    }

    resolvePromisesAndRunFollowing(parallelPromises, nextPromiseToRun) {
        return Promise.all(parallelPromises)
            .then(results => {
                this.mainData = Object.assign({}, this.mainData, ...results);
                return PromisesRunner.returnPromiseIfNotPromise(nextPromiseToRun(this.mainData))
            })
    }

    start() {
        return this.runSetOfPromisesFrom();
    }

    runSetOfPromisesFrom(startIndex = 0) {

        const parallelPromises = [];
        parallelPromises.push(Promise.resolve(this.mainData));

        for (let i = startIndex; i < this.mainPromises.length; i++) {
            const promiseToRun = this.mainPromises[i];
            if (promiseToRun.w || promiseToRun.wait) {
                return this.resolvePromisesAndRunFollowing(parallelPromises, promiseToRun.a)
                    .then(val => {
                        this.mainData = Object.assign({}, this.mainData, val);
                        return this.runSetOfPromisesFrom(i + 1);
                    });
            } else {
                parallelPromises.push(
                    this.resolvePromisesAndRunFollowing([
                        PromisesRunner.returnPromiseIfNotPromise(promiseToRun.a(this.mainData))
                    ], f => f)
                );
            }
        }

        return this.resolvePromisesAndRunFollowing(parallelPromises, f => f);
    }
}
