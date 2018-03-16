const _benchmark = metrics => {
  return () => {
    let start = Date.now();

    const mark = (name, anyData) => {
      const now = Date.now();
      const dur = now - start;
      metrics.push({name, dur});

      // update elapsed time
      start = now;
      return anyData;
    };

    // If second argument has been passed, run benchmark immediately.
    // Otherwise, returns lazy function which is useful for promise result handling.
    return function (name, anyData) {
      return (arguments.length === 1) ?
        anyData => mark(name, anyData) :
        mark(name, anyData)
        ;
    };
  };
};

module.exports = options => {
  return (req, res, next) => {
    // Toggle enable/disable benchmarking
    let isDisabled = false;
    req.disableBenchmark = () => {
      isDisabled = true;
    };
    req.enableBenchmark = () => {
      isDisabled = false;
    };

    const metrics = [];

    // Create benchmarker
    req.benchmark = _benchmark(metrics);

    // Overwrite writeHead
    // Stack default behaivor and overwrite
    const defaultWriteHead = res.writeHead;
    res.writeHead = function() {
      if (!isDisabled) {
        const values = metrics
          .reduce((prev, next) => {
            prev.push(`${next.name}; dur=${next.dur}`);
            return prev;
          }, [res.getHeader('Server-Timing')])
          .filter(v => v)
        ;
        if (values.length > 0) {
          res.setHeader('Server-Timing', values.join(', '));
        }
      }

      defaultWriteHead.apply(res, arguments);
    };

    // if module is used via express middleware, call next
    if (typeof next === 'function') {
      next();
    }
  };
};
