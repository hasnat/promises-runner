class PromisesRunner {
    constructor(mainPromises, mainData) {
        this.mainData = mainData;
        this.mainPromises = mainPromises;
    }

    static returnPromiseIfNotPromise(isThisPromise) {
        return typeof isThisPromise.then === 'function' ? isThisPromise : Promise.resolve(isThisPromise);
    }

    resolvePromisesAndRunFollowing(parallelPromises, nextPromiseToRun) {
        return Promise.all(parallelPromises)
            .then(results => {
                this.mainData = Object.assign({}, this.mainData, ...results);
                return PromisesRunner.returnPromiseIfNotPromise(nextPromiseToRun(this.mainData))
            })
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
                parallelPromises.push(PromisesRunner.returnPromiseIfNotPromise(
                    this.resolvePromisesAndRunFollowing([promiseToRun.a(this.mainData)], f => f)
                ));
            }

        }

        return this.resolvePromisesAndRunFollowing(parallelPromises, f => f);
    }

}
module.exports = PromisesRunner;
