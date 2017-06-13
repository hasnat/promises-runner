const runSetOfPromisesFrom = require('./index.js')
const sleepFor = (seconds, value, valueAs, d) => new Promise(resolve => {
    setTimeout(() => {
        console.log('resolving', {[valueAs]: value});
        resolve({[valueAs]: value});
    }, seconds);
});

const allPromises = [
    {a: (d) => sleepFor(1000, 'action1', 'a1', d), o: 'actionResult1'},
    {a: (d) => sleepFor(3000, 'action2', 'a2', d), o: 'actionResult2'},
    {a: (d) => sleepFor(1000, 'action3w', 'a3', d), o: 'actionResult3', w: true},
    {a: (d) => sleepFor(8000, 'action4', 'a4', d), o: 'actionResult4'},
    {a: (d) => sleepFor(1000, 'action5', 'a5', d), o: 'actionResult5'},
    {a: (d) => sleepFor(2000, 'action6w', 'a6', d), o: 'actionResult6', w: true},
    {a: (d) => sleepFor(2000, 'action7', 'a7', d), o: 'actionResult7'},
    {a: (d) => sleepFor(5000, 'action8w', 'a8', d), o: 'actionResult8', w: true},
    {a: (d) => sleepFor(2000, 'action9', 'a9', d), o: 'actionResult9'},
    {a: (d) => sleepFor(1000, 'action10', 'a10', d), o: 'actionResult10'},

];
runSetOfPromisesFrom(allPromises, {}, 0);

