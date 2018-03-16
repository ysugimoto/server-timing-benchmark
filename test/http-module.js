const http = require('http');
const expect = require('chai').expect;

const serverTimingBenchmark = require('../index.js');

describe('HTTP builtin module usecase test', () => {

  it('Basic benchmarking', () => {
    const server = http.createServer((req, res) => {
      serverTimingBenchmark()(req, res);
      const benchmark = req.benchmark();

      const someFunction = () => {
        return 'foo';
      };
      const ret = benchmark('someFunction', someFunction());
      res.end(ret);
    });

    server.listen(0, () => {
      http.get(`http://localhost:${server.address().port}/`, res => {
        const st = res.headers['server-timing'];
        expect(st).match(/someFunction; dur=.*/);

        let body = '';
        res.on('data', c => {
          body += c;
        });
        res.on('end', () => {
          expect(body).to.equal('foo');
          server.close();
        });
      });
    });
  });

  it('Combine headers', () => {
    const server = http.createServer((req, res) => {
      serverTimingBenchmark()(req, res);
      const benchmark = req.benchmark();

      const someFunction = () => {
        return 'foo';
      };
      const ret = benchmark('someFunction', someFunction());
      res.setHeader('Server-Timing', 'example; dur=100');
      res.end(ret);
    });

    server.listen(0, () => {
      http.get(`http://localhost:${server.address().port}/`, res => {
        const st = res.headers['server-timing'];
        expect(st).match(/example; dur=100, someFunction; dur=.*/);

        let body = '';
        res.on('data', c => {
          body += c;
        });
        res.on('end', () => {
          expect(body).to.equal('foo');
          server.close();
        });
      });
    });
  });

  it('Promise benchmarking', () => {
    const server = http.createServer((req, res) => {
      serverTimingBenchmark()(req, res);
      const benchmark = req.benchmark();

      const promiseFunc = () => {
        return new Promise(resolve => {
          setTimeout(() => resolve('foo'), 1000);
        });
      };
      promiseFunc()
        .then(benchmark('promiseFunc'))
        .then(ret => res.end(ret))
      ;
    });

    server.listen(0, () => {
      http.get(`http://localhost:${server.address().port}/`, res => {
        const st = res.headers['server-timing'];
        expect(st).match(/promiseFunc; dur=.*/);
        let body = '';
        res.on('data', c => {
          body += c;
        });
        res.on('end', () => {
          expect(body).to.equal('foo');
          server.close();
        });
      });
    });
  });

  it('Disabling benchmarking', () => {
    const server = http.createServer((req, res) => {
      serverTimingBenchmark()(req, res);
      const benchmark = req.benchmark();
      req.disableBenchmark();

      const promiseFunc = () => {
        return new Promise(resolve => {
          setTimeout(() => resolve('foo'), 1000);
        });
      };
      promiseFunc()
        .then(benchmark('promiseFunc'))
        .then(ret => res.end(ret))
      ;
    });

    server.listen(0, () => {
      http.get(`http://localhost:${server.address().port}/`, res => {
        const st = res.headers['server-timing'];
        // eslint-disable-next-line no-unused-expressions
        expect(st).to.be.undefined;
        let body = '';
        res.on('data', c => {
          body += c;
        });
        res.on('end', () => {
          expect(body).to.equal('foo');
          server.close();
        });
      });
    });
  });
});
