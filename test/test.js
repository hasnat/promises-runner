const {expect, assert} = require('chai');
const sinon = require('sinon');
const PromisesRunner = require('../index.js')

const sleepFor = (seconds, value, valueAs, d) => new Promise(resolve => (
    setTimeout(() => resolve(value ? {[valueAs]: value} : {}), seconds)
));

describe('PromisesRunner', function() {

    it('gets all data', function(done) {
        const allPromises = [
            {a: (d) => sleepFor(1, 'action1', 'a1', d)},
            {a: (d) => sleepFor(3, 'action2', 'a2', d)},
            {a: (d) => sleepFor(1, 'action3w', 'a3', d), w: true},
            {a: (d) => sleepFor(8, 'action4', 'a4', d)},
            {a: (d) => sleepFor(1, 'action5', 'a5', d)},
            {a: (d) => sleepFor(2, 'action6w', 'a6', d), w: true},
            {a: (d) => sleepFor(2, 'action7', 'a7', d)},
            {a: (d) => sleepFor(5, 'action8w', 'a8', d), w: true},
            {a: (d) => sleepFor(2, 'action9', 'a9', d)},
            {a: (d) => sleepFor(1, 'action10', 'a10', d)},
        ];

        new PromisesRunner({objectsArrayWithPromises: allPromises, data: {initialData: -1}})
            .start()
            .then(d => {
                expect(d).to.deep.equal(
                    {
                        initialData: -1,
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
            .catch(e => console.log);
    });

    it('respects the promises wait', function(done) {

        const allPromises = [
            {a: sinon.spy(() => sleepFor(20))},
            {a: sinon.spy(() => sleepFor(10))},
            {a: sinon.spy(() => sleepFor(5)), w: true},
            {a: sinon.spy(() => sleepFor(8))},
            {a: sinon.spy(() => sleepFor(3)), w: true},
            {a: sinon.spy(() => sleepFor(4))},
            {a: sinon.spy(() => sleepFor(0)), w: true},
            {a: sinon.spy(() => sleepFor(2))},
            {a: sinon.spy(() => sleepFor(0))},
        ];

        new PromisesRunner({objectsArrayWithPromises: allPromises, data: {}})
            .start()
            .then(d => {
                assert(allPromises[0].a.calledBefore(allPromises[2].a));
                assert(allPromises[1].a.calledBefore(allPromises[2].a));

                assert(allPromises[3].a.calledBefore(allPromises[4].a));
                assert(allPromises[1].a.calledBefore(allPromises[4].a));

                assert(allPromises[5].a.calledBefore(allPromises[6].a));

                done();
            })
            .catch(e => console.log);
    });
});
