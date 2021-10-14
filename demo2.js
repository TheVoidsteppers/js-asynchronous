console.log('1');

setImmediate(function() {
  console.log('--- 2 ---');
})

setTimeout(function() {
  console.log('3');
  process.nextTick(function() {
    console.log('=== 4 ===');
    process.nextTick(function() {
      console.log('=== 5 ===');
    })
  })
  new Promise(function(resolve) {
    console.log('6');
    resolve();
  }).then(function() {
    console.log('7');
  })
  setTimeout(function() {
    console.log('8');
  })
})

setTimeout(function() {
  console.log('9');
})

new Promise(function(resolve) {
  console.log('10');
  resolve();
}).then(function() {
  console.log('11');
})

process.nextTick(function() {
  console.log('=== 12 ===');
})

console.log('13');