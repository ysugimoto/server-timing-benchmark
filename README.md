# server-timing-benchmark

Benchmark server-side using Server Timing API

## Installation

This package is available on `npmjs.org`. You can intall via `npm` command:

```
$ npm install server-timing-benchmark
```

## Usage

This package supports `http/https` module and `express`.

### http

```
const http = require('http');
const serverTimingBenchmark = require('server-timing-benchmark');

http.createServer((req, res) => {
  // Enable middelware
  serverTimingBenchmark()(req, res);

  // Create benchmarker
  const benchmark = req.benchmark();

  // Sync function
  const someFunction = () => {
    return 'response';
  };
  res.end(benchmark('someFunction', someFunction()));
}).listen(8888);
```

Above server will respond with header:

```
Server-Timing: someFunction; dur=[ms]
```

with body of 'response'.

### express

```
const express = require('express');
const serverTimingBenchmark = require('server-timing-benchmark');

const app = express();
app.use(serverTimingBenchmark());
app.use((res, res) => {

  // Create benchmarker
  const benchmark = req.benchmark();

  // Async function
  const promiseFunction = () => {
    return new Promise(resolve => {
        setTimeout(() => resolve('response'), 1000);
    });
  };

  promiseFunction()
    .then(benchmark('promiseFunction'))
    .then(data => res.send(data))
  ;
});
app.listen(8888);
```

Above server will respond with header:

```
Server-Timing: promiseFunction; dur=1000
```

with body of 'response'.

## License

MIT

### Author

Yoshiaki Sugimoto

