const {expect, assert} = require('chai');
const sinon = require('sinon');
const PromisesRunner = require('../index.js')

const sleepFor = (seconds, value, valueAs, d) => new Promise(resolve => (
    setTimeout(() => resolve(value ? {[valueAs]: value} : {}), seconds)
));

describe('PromisesRunner', function() {

    it('gets all data', function(done) {
        const allPromises = [
            {promise: (d) => sleepFor(1, 'action1', 'a1', d)},
            {promise: (d) => sleepFor(3, 'action2', 'a2', d)},
            {promise: (d) => sleepFor(1, 'action3w', 'a3', d), wait: true},
            {promise: (d) => sleepFor(8, 'action4', 'a4', d)},
            {promise: (d) => sleepFor(1, 'action5', 'a5', d)},
            {promise: (d) => sleepFor(2, 'action6w', 'a6', d), wait: true},
            {promise: (d) => sleepFor(2, 'action7', 'a7', d)},
            {promise: (d) => sleepFor(5, 'action8w', 'a8', d), wait: true},
            {promise: (d) => sleepFor(2, 'action9', 'a9', d)},
            {promise: (d) => sleepFor(1, 'action10', 'a10', d)},
        ];

        new PromisesRunner({objectsArrayWithPromises: allPromises, inputData: {initialData: -1}})
            .start()
            .then(d => {
                expect(d).to.deep.equal(
                    {
                        a1: 'action1',
                        a2: 'action2',
                        a3: 'action3w',
                        a4: 'action4',
                        a5: 'action5',
                        a6: 'action6w',
                        a7: 'action7',
                        a8: 'action8w',
                        a9: 'action9',
                        a10: 'action10'
                    }
                );
                done();
            })
            .catch(done);
    });

    it('respects the promises wait', function(done) {

        const allPromises = [
            {promise: sinon.spy(() => sleepFor(20))},
            {promise: sinon.spy(() => sleepFor(10))},
            {promise: sinon.spy(() => sleepFor(5)), wait: true},
            {promise: sinon.spy(() => sleepFor(8))},
            {promise: sinon.spy(() => sleepFor(3)), wait: true},
            {promise: sinon.spy(() => sleepFor(4))},
            {promise: sinon.spy(() => sleepFor(0)), wait: true},
            {promise: sinon.spy(() => sleepFor(2))},
            {promise: sinon.spy(() => sleepFor(0))},
        ];

        new PromisesRunner({objectsArrayWithPromises: allPromises, inputData: {}})
            .start()
            .then(d => {
                assert(allPromises[0].promise.calledBefore(allPromises[2].promise));
                assert(allPromises[1].promise.calledBefore(allPromises[2].promise));

                assert(allPromises[3].promise.calledBefore(allPromises[4].promise));
                assert(allPromises[1].promise.calledBefore(allPromises[4].promise));

                assert(allPromises[5].promise.calledBefore(allPromises[6].promise));

                done();
            })
            .catch(done);
    });

    it('gets saves all data to specified key', function(done) {
        const allPromises = [
            {promise: (d) => Promise.resolve({a: 'A'})},
            {promise: (d) => Promise.resolve({b: 'B'}), wait: true},
            {promise: (d) => Promise.resolve({c: 'C'})},
            {promise: (d) => Promise.resolve('D'), outputKey: 'd'},
        ];

        new PromisesRunner({
            objectsArrayWithPromises: allPromises,
            inputData: {someData: -1},
            outputDataKey: 'someOutputKey'}
        )
            .start()
            .then(d => {
                expect(d).to.deep.equal(
                    {
                        someOutputKey: {
                            a: 'A',
                            b: 'B',
                            c: 'C',
                            d: 'D'
                        }
                    }
                );
                done();
            })
            .catch(done);
    });

    it('same keys are merged and previous values replaced', function(done) {
        const allPromises = [
            {promise: (d) => Promise.resolve({a: 'A'})},
            {promise: (d) => Promise.resolve({b: 'B'}), wait: true},
            {promise: (d) => Promise.resolve({a: 'C'})},
        ];

        new PromisesRunner({
            objectsArrayWithPromises: allPromises,
            inputData: {someData: -1},
            outputDataKey: 'someOutputKey'
        })
            .start()
            .then(d => {
                expect(d).to.deep.equal(
                    {
                        someOutputKey: {
                            a: 'C',
                            b: 'B'
                        }
                    }
                );
                done();
            })
            .catch(done);
    });

    it('same keys are merged and previous values replaced', function(done) {
        const allPromises = [
            {promise: (d) => Promise.resolve({a: 'A'})},
            {promise: (d) => Promise.resolve({b: 'B'}), wait: true},
            {promise: (d) => Promise.resolve({a: 'C'}), wait: true},
            {promise: (d) => Promise.resolve('F'), outputKey: 'a'},
        ];

        new PromisesRunner({
            objectsArrayWithPromises: allPromises,
            inputData: {someData: -1},
            outputDataKey: 'someOutputKey'
        })
            .start()
            .then(d => {
                expect(d).to.deep.equal(
                    {
                        someOutputKey: {
                            a: 'F',
                            b: 'B'
                        }
                    }
                );
                done();
            })
            .catch(done);
    });

    it('same keys are merged as arrays', function(done) {
        const allPromises = [
            {promise: (d) => Promise.resolve({a: 'A'})},
            {promise: (d) => Promise.resolve({b: 'B'}), wait: true},
            {promise: (d) => Promise.resolve({a: 'C'})},
            {promise: (d) => Promise.resolve({a: 'D'}), outputKey: 'abc'},
            {promise: (d) => Promise.resolve({c: 'C'})},
            {promise: (d) => Promise.resolve('F'), outputKey: 'b'},
        ];

        new PromisesRunner({
            objectsArrayWithPromises: allPromises,
            inputData: {someData: -1},
            outputDataKey: 'someOutputKey',
            mergeSameKeyByConvertingToArray: true
        })
            .start()
            .then(d => {
                expect(d).to.deep.equal(
                    {
                        someOutputKey: {
                            a: ['A', 'C'],
                            b: ['B', 'F'],
                            c: 'C',
                            abc: {
                                a: 'D'
                            }
                        }
                    }
                );
                done();
            })
            .catch(done);
    });

    it('gets merges data and sends to input', function(done) {
        const allPromises = [
            {promise: sinon.spy(() => Promise.resolve({a0: 'action0'}))},
            {promise: sinon.spy(() => Promise.resolve({a1: 'action1'}))},
            {promise: sinon.spy(() => Promise.resolve({a2: 'action2'}))},
            {promise: sinon.spy(() => Promise.resolve({a3: 'action3w'})), wait: true},
            {promise: sinon.spy(() => Promise.resolve({a4: 'action4'}))},
            {promise: sinon.spy(() => Promise.resolve({a5: 'action5w'})), wait: true},
            {promise: sinon.spy(() => Promise.resolve({a6: 'action6'}))},
            {promise: sinon.spy(() => Promise.resolve({a7: 'action7w'})), wait: true},
            {promise: sinon.spy(() => Promise.resolve({a8: 'action8'}))},
            {promise: sinon.spy(() => Promise.resolve({a9: 'action9'})), outputKey: 'abc'},
        ];

        new PromisesRunner({
            objectsArrayWithPromises: allPromises,
            inputData: {someData: -1},
            outputDataKey: 'someOutputKey',
            mergePromiseOutputToNextPromiseInput: true
        })
            .start()
            .then(d => {
                expect(d).to.deep.equal(
                    {
                        someOutputKey: {
                            a0: 'action0',
                            a1: 'action1',
                            a2: 'action2',
                            a3: 'action3w',
                            a4: 'action4',
                            a5: 'action5w',
                            a6: 'action6',
                            a7: 'action7w',
                            a8: 'action8',
                            abc: {
                                a9: 'action9'
                            }
                        },
                    }
                );
                expect(allPromises[0].promise.firstCall.args[0]).to.deep.equal(
                    {someData: -1, someOutputKey: {}}
                );
                expect(allPromises[3].promise.firstCall.args[0]).to.deep.equal(
                    {someData: -1,
                        someOutputKey: {
                            a0: 'action0',
                            a1: 'action1',
                            a2: 'action2'
                        }
                    }
                );
                expect(allPromises[5].promise.firstCall.args[0]).to.deep.equal(
                    {someData: -1,
                        someOutputKey: {
                            a0: 'action0',
                            a1: 'action1',
                            a2: 'action2',
                            a3: 'action3w',
                            a4: 'action4'
                        }
                    }
                );
                expect(allPromises[7].promise.firstCall.args[0]).to.deep.equal(
                    {someData: -1,
                        someOutputKey: {
                            a0: 'action0',
                            a1: 'action1',
                            a2: 'action2',
                            a3: 'action3w',
                            a4: 'action4',
                            a5: 'action5w',
                            a6: 'action6'
                        }
                    }
                );
                done();
            })
            .catch(done);
    });
});
