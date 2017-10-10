# promises-runner

[![Build Status](https://travis-ci.org/hasnat/promises-runner.svg)](https://travis-ci.org/hasnat/promises-runner)

[![NPM](https://nodei.co/npm/promises-runner.png)](https://nodei.co/npm/promises-runner/)

Run promises from an array of objects waiting for some promises to be resolved before continuing running others

## Install

    npm install --save promises-runner

## Api
```js
PromisesRunner({
    objectsArrayWithPromises: [Object],                 // default []
    inputData: Object,                                  // default {}
    outputDataKey: string|false,                        // default false
    mergePromiseOutputToNextPromiseInput: true|false,   // default false
    mergeSameKeyByConvertingToArray: true|false,        // default false
    logger: Function|false         // default false
    })
```
objectsArrayWithPromises single object should be
`{promise: (inputData) => Promise, wait: true|false, outputKey: string}`


logger function
`logger: (action: String, promiseReturningFunction: Function, inputOutputOrError: Mixed)`
action = START|ERROR|DONE
promiseReturningFunction = function in promise key in objectsArrayWithPromises
inputOutputOrError = would be input of promise if action = START,
                     output of promise if action = DONE
                     and error if action = ERROR

Check example logger function at end of README

## Usage example

```js

var PromisesRunner = require('promises-runner')

function expensiveOperation(value) {
  return Promise.resolve(value)
}
const objectsArrayWithPromises = [
    {promise: expensiveOperation},              // <--┐
    {promise: expensiveOperation},              // <----- these will run in parallel
    {promise: expensiveOperation},              // <--┘
    {promise: expensiveOperation, wait: true},  // this will wait before all previous are resolved
    {promise: expensiveOperation},              // these 2 -- after the previous one is resolved
    {promise: expensiveOperation},              // these 2 -- and are ran in parallel
    {promise: expensiveOperation, wait: true},  // this will wait before all previous are resolved
    {promise: expensiveOperation},              // these 2 -- after the previous one is resolved
    {promise: expensiveOperation},              // these 2 -- and are ran in parallel
]
var pr = new PromisesRunner({objectsArrayWithPromises});

pr.start();
```

### Example of objects being merged as per outputKey and mergePromiseOutputToNextPromiseInput
```js
const sleepFor = (seconds, value, valueAs, d) => new Promise(resolve => (
    setTimeout(() => resolve(value ? {[valueAs]: value} : {}), seconds)
));
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
            {promise: (d) => sleepFor(1, 'action10', 'a10', d), outputKey: 'abc'},
        ];

        new PromisesRunner({
            objectsArrayWithPromises: allPromises, 
            inputData: {someInputData: -1},
            outputDataKey: 'outputKey',                 // default false
            mergePromiseOutputToNextPromiseInput: true  // default false
        })
            .start()
            .then(console.log)
            
/* 
for outputDataKey = 'outputKey', mergePromiseOutputToNextPromiseInput = true
input for all promises: {someInputData: -1, outputKey: {a1: 'action1', a2: 'action2' ....}}
output: 
{
    outputKey: { 
        a1: 'action1',
        a2: 'action2',
        a3: 'action3w',
        a4: 'action4',
        a5: 'action5',
        a6: 'action6w',
        a7: 'action7',
        a8: 'action8w',
        a9: 'action9',
        abc: {
            a10: 'action10'
        }
    }
}
*/
/* 
for outputDataKey = false, mergePromiseOutputToNextPromiseInput = true
input for all promises: {someInputData: -1, a1: 'action1', a2: 'action2' ....}
output: 
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
    abc: {
        a10: 'action10'
    }
}
*/
/* 
for default outputDataKey = false, mergePromiseOutputToNextPromiseInput = false
input for all promises: {someInputData: -1}
output: 
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
    abc: {
        a10: 'action10'
    }
}
*/
```


Example logger
`taskLogger.js`
```js
const chalk = require('chalk');
const lowerCase = require('lodash/lowerCase');
const pad = require('lodash/pad');
module.exports = (action, relatedPromise, relatedData) => {
    let consoleColor = chalk;
    switch (action) {
        case 'START':
            consoleColor = chalk.bgKeyword('orange');
            break;
        case 'DONE':
            consoleColor = chalk.bgKeyword('green');
            break;
        case 'ERROR':
            consoleColor = chalk.bgKeyword('red');
            break;
    }
    console.log(consoleColor(`[${pad(action, 9)}]`), '==>', lowerCase(relatedPromise.name));
};
```