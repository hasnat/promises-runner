# promises-runner

[![Build Status](https://travis-ci.org/hasnat/promises-runner.svg)](https://travis-ci.org/hasnat/promises-runner)

[![NPM](https://nodei.co/npm/promises-runner.png)](https://nodei.co/npm/promises-runner/)

Run promises from an array of objects waiting for some promises to be resolved before continuing running others

## Install

    npm install --save promises-runner

## Api
`PromisesRunner({objectsArrayWithPromises: [Object], data: Object})`
objectsArrayWithPromises single object should be `{a: Promise, w: true|false}`


## Usage example

```js

var PromisesRunner = require('promises-runner')

function expensiveOperation(value) {
  return Promise.resolve(value)
}
const objectsArrayWithPromises = [
    {a: expensiveOperation},            // <--┐
    {a: expensiveOperation},            // <----- these will run in parallel
    {a: expensiveOperation},            // <--┘
    {a: expensiveOperation, w: true},   // this will wait before all previous are resolved
    {a: expensiveOperation},            // these 2 -- after the previous one is resolved
    {a: expensiveOperation},            // these 2 -- and are ran in parallel
    {a: expensiveOperation, w: true},   // this will wait before all previous are resolved
    {a: expensiveOperation},            // these 2 -- after the previous one is resolved
    {a: expensiveOperation},            // these 2 -- and are ran in parallel
]
var pr = new PromisesRunner({objectsArrayWithPromises});

pr.start();
```

### Example of objects being merged
```js
const sleepFor = (seconds, value, valueAs, d) => new Promise(resolve => (
    setTimeout(() => resolve(value ? {[valueAs]: value} : {}), seconds)
));
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
            .then(console.log)
            
/* 
output will be
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
*/
```