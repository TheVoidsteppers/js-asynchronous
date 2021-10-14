---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: "text-center"
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
---

# 异步:现在与将来

---

# 为什么需要异步

<div v-click>

我们在开发中会遇到部分代码是现在运行，而另一部分则要在将来运行——现在和将来之间有段时间间隙，在这段间隙中，程序没有活跃执行。

</div>

<div v-click>

我们需要通过一种的方法来管理这段时间间隙的状态---异步

</div>

<!--
我们发送了一个ajax请求，并要对返回的数据做处理。但是这个请求并不是马上就有数据返回回来的，而是需要一定时间。
也就是有段时间间隙，在一段时间过后（获取到ajax请求数据后），才会对数据进行处理
-->

<!--
  等待用户输入、从数据库或文件系统中请求数据、通过网络发送数据并等待响应，
  或者是在以固定时间间隔执行重复任务（比如动画）。
-->

---

# 分块的程序

在一个单个 .js 文件中，几乎一定是由多个块构成的。这些块中只有一个是现在执行，其余的则会在将来执行。最常见的块单位是函数。

<div v-click>

程序中将来执行的部分并不一定在现在运行的部分执行完之后就立即执行。

```ts {all}
// ajax(..)是某个库中提供的某个Ajax函数
var data = ajax("http://some.url.1");
console.log(data);
// data不会包含Ajax结果
```

</div>

<div v-click>

现在无法完成的任务将会异步完成，因此并不会出现人们本能地认为会出现的阻塞行为。

</div>

<div v-click>

从现在到将来的“等待”，最简单的方法是使用一个通常称为回调函数的函数：

```ts
// ajax(..)是某个库中提供的某个Ajax函数
ajax("http://some.url.1", function myCallbackFunction(data) {
  console.log(data); // 这里得到了一些数据
});
```

</div>

<div v-click>

任何时候，只要把一段代码包装成一个函数，并指定它在响应某个事件（定时器、鼠标点击、Ajax 响应等）时执行，你就是在代码中创建了一个将来执行的块，也由此在这个程序中引入了异步机制。

</div>

---

# 异步控制台

没有规范或一组需求指定 console.\* 方法族如何工作，它是由宿主环境添加到 JavaScript 中的。因此，不同的浏览器和 JavaScript 环境可以按照自己的意愿来实现。

在某些条件下，某些浏览器的 console.log(..) 并不会把传入的内容立即输出。

```ts {all|1-5|7|9|all}
var foo = [
  {
    a: 1,
  },
];

console.log(foo);

foo[0].a += 1;
```

<div v-click>

出现这种情况的主要原因是，在许多程序（不只是 JavaScript）中，I/O 是非常低速的阻塞部分。所以，（从页面/UI 的角度来说）浏览器在后台异步处理控制台 I/O 能够提高性能。

</div>

---

# 事件循环

直到 ES6，JavaScript 才真正内建有直接的异步概念。

<div v-click>

之前异步行为，比如 ajax，文件上传，用户点击等，JavaScript 是如何实现的？

</div>

<!-- JavaScript 引擎本身所做的只不过是在需要的时候，在给定的任意时刻执行程序中的单个代码块。 -->

<div v-click>

JavaScript 引擎并不是独立运行的，它运行在宿主环境中（Web 浏览器，Nodejs），所有这些环境都有一个共同“点”，即它们都提供了一种机制来处理程序中多个块的执行，且执行每块时调用 JavaScript 引擎，这种机制被称为事件循环。

</div>

<!-- 换句话说，JavaScript 引擎本身并没有时间的概念，只是一个按需执行 JavaScript 任意代码片段的环境。“事件”（JavaScript 代码执行）调度总是由包含它的环境进行。 -->

<div v-click>

举例来说，如果你的 JavaScript 程序发出一个 Ajax 请求，要从服务器获取一些数据，那你在一个函数中设置好响应代码，然后 JavaScript 引擎会通知宿主环境：“现在我要暂停执行，你一旦完成网络请求，拿到了数据后，就调用这个回调函数。”

然后浏览器就会设置侦听来自网络的响应，拿到数据之后，就会把回调函数插入到事件循环中，以此实现对这个回调的调度执行。

</div>

---

事件循环的原理

```ts {all}
// eventLoop是一个用作队列的数组
// （先进，先出）
var eventLoop = [];
var event;

// “永远”执行
while (true) {
  // 一次tick
  if (eventLoop.length > 0) {
    // 拿到队列中的下一个事件
    event = eventLoop.shift();
    // 现在，执行下一个事件
    try {
      event();
    } catch (err) {
      reportError(err);
    }
  }
}
```

有一个用 while 循环实现的持续运行的循环，循环的每一轮称为一个 tick。对每个 tick 而言，如果在队列中有等待事件，那么就会从队列中摘下一个事件并执行。这些事件就是你写的回调函数。

<!-- setTimeout(..) 并没有把你的回调函数挂在事件循环队列中。它所做的是设定一个定时器。当定时器到时后，环境会把你的回调函数放在事件循环中，这样，在未来某个时刻的 tick 会摘下并执行这个回调。 -->

<!-- 如果这时候事件循环中已经有 20 个项目了会怎样呢？你的回调就会等待。它得排在其他项目后面——通常没有抢占式的方式支持直接将其排到队首。这也解释了为什么 setTimeout(..) 定时器的精可能不高。大体说来，只能确保你的回调函数不会在指定的时间间隔之前运行，但可能会在那个时刻运行，也可能在那之后运行，要根据事件队列的状态而定。 -->

---

<img src="/assets/images/event-loop.jpeg" style="width: 60%; float:left;"/>

<div style="margin-left: 10px; width: calc(40% - 10px); float:left;">
  <h4 style="color: #23970E;">MacroTask（宏任务）:</h4>
  <div style="margin-top: 5px;">setTimeout</div>
  <div style="margin-top: 5px;">setInterval</div>
  <div style="margin-top: 5px;">setImmediate（只有IE10支持, Node）</div>
  <div style="margin-top: 5px;">I/O</div>
  <div style="margin-top: 5px;">UI Rendering(浏览器独有)</div>
  <h4 style="margin-top: 20px; color: #F99A3C;">MicroTask（微任务）:</h4>
  <div style="margin-top: 5px;">Promise</div>
  <div style="margin-top: 5px;">Process.nextTick（Node独有）</div>
  <div style="margin-top: 5px;">MutationObserver</div>
  <div style="margin-top: 5px;">Object.observe(废弃)</div>
</div>

---

1. 执行全局 Script 同步代码，这些同步代码有一些是同步语句，有一些是异步语句；遇到异步语句会判断是宏任务还是微任务，并压入对应的队列中。
2. 全局 Script 代码执行完毕后，调用栈会清空；
3. 从微队列中取出位于队首的回调任务，放入调用栈中执行，执行完后微队列长度减 1；
4. 继续取出位于队首的任务，放入调用栈中执行，以此类推，直到把微队列中的所有任务都执行完毕。注意，如果在执行 microtask 的过程中，又产生了 microtask，那么会加入到队列的末尾，也会在这个周期被调用执行；
5. 微队列中的所有任务都执行完毕，此时微队列为空队列，调用栈 Stack 也为空；
6. 取出宏队列中位于队首的任务，放入调用栈中执行；
7. 执行完毕后，调用栈为空；
8. 重复第 3-7 个步骤；
9. 重复第 3-7 个步骤；
10. ......

---

# 并行线程

“异步”和“并行”常常被混为一谈，但实际上它们的意义完全不同。异步是关于现在和将来的时间间隙，而并行是关于能够同时发生的事情。

并行计算最常见的工具就是进程和线程。进程和线程独立运行，并可能同时运行，多个线程能够共享单个进程的内存。

事件循环把自身的工作分成一个个任务并顺序执行，不允许对共享内存的并行访问和修改。

<div v-click>

JavaScript 是单线程的还是并行线程？

</div>

<div v-click>

```ts {all}
var a = 20;
function foo() {
  a = a + 1;
}
function bar() {
  a = a * 2;
}

ajax("http://some.url.1", foo);
ajax("http://some.url.2", bar);
```

</div>

<!-- 根据 JavaScript 的单线程运行特性，如果 foo() 运行在 bar() 之前，a 的结果是 42，而如果bar() 运行在 foo() 之前的话，a 的结果就是 41。 -->

---

如果上面的例子共享同一数据并行执行的话

线程 1（X 和 Y 是临时内存地址）：

```ts
function foo() {
  a = a + 1;
}
a. 把 a 的值加载到 X
b. 把 1 保存在 Y
c. 执行 X 加 Y，结果保存在 X
d. 把 X 的值保存在 a
```

线程 2（X 和 Y 是临时内存地址）：

```ts
function bar() {
  a = a * 2;
}
a. 把 a 的值加载到 X
b. 把 2 保存在 Y
c. 执行 X 乘 Y，结果保存在 X
d. 把 X 的值保存在 a
```

---

假设两个线程并行执行。它们在临时步骤中使用了共享的内存地址 X 和 Y。

```ts
1a (把a的值加载到X ==> 20)
2a (把a的值加载到X ==> 20)
1b (把1保存在Y ==> 1)
2b (把2保存在Y ==> 2)
1c (执行X加Y，结果保存在X ==> 22)
1d (把X的值保存在a ==> 22)
2c (执行X乘Y，结果保存在X ==> 44)
2d (把X的值保存在a ==> 44)
```

a 的结果将是 44。但如果按照以下顺序执行呢

```ts
1a (把a的值加载到X ==> 20)
2a (把a的值加载到X ==> 20)
2b (把2保存在Y ==> 2)
1b (把1保存在Y ==> 1)
2c (执行X乘Y，结果保存在X ==> 20)
1c (执行X加Y，结果保存在X ==> 21)
1d (把X的值保存在a ==> 21)
2d (把X的值保存在a ==> 21)
```

a 的结果将是 21。当然还有更多种可能。。。

---

所以，多线程编程是非常复杂的。因为如果不通过特殊的步骤来防止这种中断和交错运行的话，可能会得到出乎意料的、不确定的行为。

JavaScript 从不跨线程共享数据，这意味着不需要考虑这一层次的不确定性。

---

## 完整运行

由于 JavaScript 的单线程特性，foo()、bar() 中的代码具有原子性。

也就是说，一旦 foo() 开始运行，它的所有代码都会在 bar() 中的任意代码运行之前完成，或者相反。这称为完整运行特性。

<div v-click grid="~ cols-2 gap-2" m="-t-2">

```ts {all}
var a = 1;
var b = 2;

function foo() {
  a++;
  b = b * a;
  a = b + 3;
}

function bar() {
  b--;
  a = 8 + b;
  b = a * 2;
}

ajax("http://some.url.1", foo);
ajax("http://some.url.2", bar);
```

<span>由于 foo() 不会被 bar() 中断，bar() 也不会被 foo() 中断，所以这个程序只有两个可能的输出，取决于这两个函数哪个先运行</span>

</div>

<!-- 在 JavaScript 的特性中，这种函数顺序的不确定性就是通常所说的竞态条件，foo() 和 bar() 相互竞争，看谁先运行。具体来说，因为无法可靠预测 a 和 b 的最终结果，所以才是竞态条件。 -->

---

# 并发

JavaScript 是如何处理并发的？

假设我们要开发一个随着用户向下滚动页面而逐渐加载更多内容的网站。要实现这一特性，至少需要两个独立的“进程”同时运行。

第一个“进程”在用户向下滚动页面触发 onscroll 事件时发起 Ajax 请求。第二个“进程”接收 Ajax 响应，处理返回的数据。

显然，如果用户滚动页面足够快的话，在等待第一个响应返回并处理的时候可能会看到两个或更多 onscroll 事件被触发，因此将得到快速触发彼此交替的 onscroll 事件和 Ajax 响应事件。

---

“进程”1（onscroll 事件）：

```
onscroll, 请求1
onscroll, 请求2
onscroll, 请求3
onscroll, 请求4
onscroll, 请求5
onscroll, 请求6
onscroll, 请求7
```

“进程”2（Ajax 响应事件）：

```
响应1
响应2
响应3
响应4
响应5
响应6
响应7
```

很可能某个 onscroll 事件和某个 Ajax 响应事件恰好同时可以处理。

---

假设这些事件的时间线是这样的：

```
onscroll, 请求1
onscroll, 请求2 响应1
onscroll, 请求3 响应2
响应3
onscroll, 请求4
onscroll, 请求5
onscroll, 请求6 响应4
onscroll, 请求7
响应6
响应5
响应7
```

根据事件循环的概念，JavaScript 一次只能处理一个事件，所以要么是 onscroll，请求 2 先发生，要么是响应 1 先发生，但是不会同时发生。

---

```
onscroll, 请求1 <--- 进程1启动
onscroll, 请求2
响应1 <--- 进程2启动
onscroll, 请求3
响应2
响应3
onscroll, 请求4
onscroll, 请求5
onscroll, 请求6
响应4
onscroll, 请求7 <--- 进程1结束
响应6
响应5
响应7 <--- 进程2结束
```

虽然“进程”1 和“进程”2 并发运行（任务级并行），但是它们的各个事件是在事件循环队列中依次运行的。

---

## 非交互

两个或多个“进程”在同一个程序内并发地交替运行它们的事件时，如果这些任务彼此不相关，就不一定需要交互。如果进程间没有相互影响的话，不确定性是完全可以接受的。

```ts{all}
var res = {};
function foo(results) {
 res.foo = results;
}
function bar(results) {
 res.bar = results;
}

ajax("http://some.url.1", foo);
ajax("http://some.url.2", bar);
```

foo() 和 bar() 是两个并发执行的“进程”，按照什么顺序执行是不确定的。但是，我们构建程序的方式使得无论按哪种顺序执行都无所谓，因为它们是独立运行的，不会相互影响。

---

## 交互

更常见的情况是，并发的“进程”需要相互交流，比如通过作用域或 DOM 间接交互。如果出现这样的交互，就需要对它们的交互进行协调以避免竞态的出现。

```ts{all}
var res = [];
function response(data) {
 res.push(data);
}

ajax("http://some.url.1", response);
ajax("http://some.url.2", response);
```

<!-- 我们假定期望的行为是 res[0] 中放调用 "http://some.url.1" 的结果，res[1] 中放调用"http://some.url.2" 的结果。有时候可能是这样，但有时候却恰好相反，这要视哪个调用先完成而定。 -->

这种不确定性很有可能就是一个竞态条件 bug。

假如我们需要 'some.url.1' 返回的结果在 res[0]，'some.url.2' 返回的结果在 res[1]

---

可以协调交互顺序来处理这样的竞态条件：

```ts{all}
var res = [];
function response(data) {
  if (data.url === "http://some.url.1") {
    res[0] = data;
  }
  else if (data.url === "http://some.url.2") {
    res[1] = data;
  }
}

ajax("http://some.url.1", response);
ajax("http://some.url.2", response);
```

不管哪一个 Ajax 响应先返回，我们都要通过查看 data.url 判断应该把响应数据放在 res 数组中的什么位置上。res[0] 总是包含 "http://some.url.1" 的结果，res[1] 总是包含 "http://some.url.2" 的结果。通过简单的协调，就避免了竞态条件引起的不确定性。

---

## 协作

还有一种并发合作方式，称为并发协作。

其基本概念是将一个长期运行的“进程”，并将其分割成多个步骤或多批任务，使得其他并发“进程”有机会将自己的运算插入到事件循环队列中交替运行。

<div v-click>

举例来说，考虑一个需要遍历很长的结果列表进行值转换的 Ajax 响应处理函数。

```ts{all}
var res = [];
function response(data) {
  // 添加到已有的res数组
  res = res.concat(
    // 创建一个新的变换数组把所有data值加倍
    data.map(function(val){
      return val * 2;
    })
  );
}
ajax("http://some.url.1", response);
ajax("http://some.url.2", response);
```

如果 "http://some.url.1"返回的数据有 1000 万条记录的话,就可能需要运行相当一段时间,这样的“进程”运行时，页面上的其他代码都不能运行。

</div>

---

所以，要创建一个协作性更强更友好且不会霸占事件循环队列的并发系统，你可以异步地批处理这些结果。每次处理之后返回事件循环，让其他等待事件有机会运行。

```ts{all}
var res = [];
function response(data) {
  // 一次处理1000个
  var chunk = data.splice(0, 1000);
    // 添加到已有的res组
    res = res.concat(
    // 创建一个新的数组把chunk中所有值加倍
      chunk.map( function(val){
      return val * 2;
    })
  );
  // 还有剩下的需要处理吗？
  if (data.length > 0) {
    // 异步调度下一次批处理
    setTimeout(function(){
      response(data);
    }, 0);
  }
}

ajax("http://some.url.1", response);
ajax("http://some.url.2", response);
```

---

# 任务

在 ES6 中，有一个新的概念建立在事件循环队列之上，叫作任务队列。

目前为止，这是一个没有公开 API 的机制，所以我们目前只从概念上进行描述。

<div v-click>

它是挂在事件循环队列的每个 tick 之后的一个队列。在事件循环的每个 tick 中，新出现的异步动作不会导致一个完整的新事件添加到事件循环队列中，而会在当前 tick 的任务队列末尾添加一个任务。

</div>

<div v-click>

事件循环队列类似于一个游乐园游戏：玩过了一个游戏之后，你需要重新到队尾排队才能再玩一次。而任务队列类似于玩过了游戏之后，插队接着继续玩。

</div>

<div v-click>

一个任务可能引起更多任务被添加到同一个队列末尾。所以，理论上说，任务循环可能无限循环，进而导致程序的饿死，无法转移到下一个事件循环 tick。从概念上看，这和代码中的无限循环的体验几乎是一样的。

</div>

---

设想一个调度任务的 API，称其为 schedule(..)：

```ts{all}
console.log("A");

setTimeout(function() {
 console.log("B");
}, 0);

// 理论上的"任务API"
schedule(function() {
  console.log("C");
  schedule(function() {
    console.log("D");
  });
});
```

<div v-click>

可能你认为这里会打印出 A B C D，但实际打印的结果是 A C D B。因为任务处理是在当前事件循环 tick 结尾处，且定时器触发是为了调度下一个事件循环 tick。

</div>

---

# 语句顺序

代码中语句的顺序和 JavaScript 引擎执行语句的顺序并不一定要一致。

```ts{all}
var a, b;
a = 10;
b = 30;
a = a + 1;
b = b + 1;
console.log(a + b); // 42
```

这段代码中没有显式的异步，所以很可能它的执行过程是从上到下一行行进行的。

---

但是，JavaScript 引擎在编译这段代码之后,可能会发现通过重新安排这些语句的顺序有可能提高执行速度。

<div v-click>
```ts{all}
var a, b; 
a = 10; 
a++; 
b = 30; 
b++; 
console.log(a + b); // 42
```
</div>

<div v-click>
```ts{all}
var a, b; 
a = 11; 
b = 31; 
console.log(a + b); // 42
```
</div>

<div v-click>
```ts{all}
// 因为a和b不会被再次使用
// 我们可以inline，从而完全不需要它们！
console.log(42); // 42
```
</div>

<div v-click>

但是这里有一种场景，其中特定的优化是不安全的。

</div>

---

```ts{all}
function foo() {
 console.log(b);
 return 1;
}

var a, b, c;
// ES5.1 getter字面量语法
c = {
  get bar() {
    console.log(a);
    return 1;
  }
};
a = 10;
b = 30;
a += foo(); // 30
b += c.bar; // 11
console.log(a + b); // 42
```

如果不是因为代码片段中的语句 console.log(..)，JavaScript 引擎如果愿意的话，本来可以自由地把代码重新排序如下：

---

```ts{all}
// ...
a = 10 + foo();
b = 30 + c.bar;
// ...
```

要理解：代码编写的方式（从上到下的模式）和编译后执行的方式之间的联系非常脆弱。

---

# 小结

<div></div>

- JavaScript 程序总是至少分为两个块：只有一块是现在运行；其他块将来运行，以响应某个事件。

- 一旦有事件需要运行，事件循环就会运行，直到队列清空。事件循环的每一轮称为一个 tick。用户交互、IO 和定时器会向事件队列中加入事件。

- 任意时刻，一次只能从队列中处理一个事件。执行事件的时候，可能直接或间接地引发一个或多个后续事件。

- 并发是指两个或多个事件链随时间发展交替执行，以至于从更高的层次来看，就像是同时在运行（尽管在任意时刻只处理一个事件）。通常需要对这些并发执行的“进程”进行某种形式的交互协调，比如需要确保执行顺序或者需要防止竞态出现。还有一些“进程”需要通过把自身分割为更小的块，以便其他“进程”插入进来。
