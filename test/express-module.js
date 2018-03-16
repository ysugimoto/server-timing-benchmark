const http = require('http');
const express = require('express');
const expect = require('chai').expect;

const serverTimingBenchmark = require('../index.js');

describe('Express middleware usecase test', () => {

  it('Basic benchmarking', () => {
    const app = express();
    app.use(serverTimingBenchmark());
    app.use((req, res) => {
      const benchmark = req.benchmark();

      const someFunction = () => {
        return 'foo';
      };
      const ret = benchmark('someFunction', someFunction());
      res.send(ret);
    });

    const server = app.listen(0, () => {
      http.get(`http://localhost:${server.address().port}/`, res => {
        const st = res.headers['server-timing'];
        expect(st).match(/someFunction; dur=.*;?/);
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
    const app = express();
    app.use(serverTimingBenchmark());
    app.use((req, res) => {
      const benchmark = req.benchmark();

      const promiseFunc = () => {
        return new Promise(resolve => {
          resolve('foo');
        });
      };
      return promiseFunc()
        .then(benchmark('promiseFunc'))
        .then(ret => res.send(ret))
      ;
    });

    const server = app.listen(0, () => {
      http.get(`http://localhost:${server.address().port}/`, res => {
        const st = res.headers['server-timing'];
        expect(st).match(/promiseFunc; dur=.*;?/);
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
    const app = express();
    app.use(serverTimingBenchmark());
    app.use((req, res) => {
      const benchmark = req.benchmark();
      req.disableBenchmark();

      const promiseFunc = () => {
        return new Promise(resolve => {
          resolve('foo');
        });
      };
      return promiseFunc()
        .then(benchmark('promiseFunc'))
        .then(ret => {
          res.send(ret);
        })
      ;
    });

    const server = app.listen(0, () => {
      http.get(`http://localhost:${server.address().port}/`, res => {
        const st = res.headers['server-timing'];
        // eslint-disable-next-line no-unused-expressions
        expect(st).to.be.empty;
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
