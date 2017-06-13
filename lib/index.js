const returnPromiseIfNotPromise = isThisPromise => typeof isThisPromise.then === 'function' ? isThisPromise : Promise.resolve(isThisPromise);
const runSetOfPromisesFrom = (allPromises, mainData, startIndex) => {

    const parallelPromises = [];
    parallelPromises.push(Promise.resolve(mainData));

    let i = startIndex;
    for (; i < allPromises.length; i++) {
        const promiseToRun = allPromises[i]
        if (promiseToRun.w) {
            return Promise.all(parallelPromises)
                .then(results => {
                    mainData = Object.assign({}, mainData, ...results);
                    return returnPromiseIfNotPromise(promiseToRun.a(mainData))
                })
                .then(val => runSetOfPromisesFrom(allPromises, Object.assign({}, mainData, val), i + 1))
        } else {
            parallelPromises.push(returnPromiseIfNotPromise(promiseToRun.a(mainData)));
        }

    }
    if (i >= allPromises.length) {
        return Promise.resolve(mainData)
    }
};
module.exports = runSetOfPromisesFrom;