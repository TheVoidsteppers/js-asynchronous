console.log('1');

setTimeout(function() {
  console.log('2');
  new Promise(function(resolve) {
    console.log('3');
    resolve();
  }).then(function() {
    console.log('4');
  })
})

new Promise(function(resolve) {
  console.log('5');
  resolve();
}).then(function() {
  console.log('6');
  new Promise(function(resolve) {
    console.log('7');
    resolve();
  }).then(function() {
    console.log('8');
  })
  setTimeout(function() {
    console.log('9');
  })
})

console.log('10');
