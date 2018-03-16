const serverTiming = require('server-timing');

module.exports = options => {
  const stm = serverTiming(Object.assign(options || {}, {total: false}));
  return (req, res, next) => {

    // Toggle enable/disable benchmarking
    let isDisabled = false;
    req.disableBenchmark = () => {
      isDisabled = true;
    };
    req.enableBenchmark = () => {
      isDisabled = false;
    };

    // Create benchmarker
    req.benchmark = () => {
      let start = Date.now();
      const mark = (name, anyData) => {
        const mark = Date.now();
        if (!isDisabled) {
          res.setMetric(name, (mark - start));
        }
        // update elapsed time
        start = mark;
        return anyData;
      };

      // If second argument has been passed, run benchmark immediately.
      // Otherwise, returns lazy function which is useful for promise result handling.
      //
      // ## Example
      // const benchmark = req.benchmark();
      //
      // // Call immediately (basic usage)
      // benchmark('someFunction', someFunction())
      //
      // // Benchmark with promise
      // someProcess()
      // .then(benchmark('someProcess'))
      // .then(result => {
      //   // do something
      //  });
      return function (name, anyData) {
        return (arguments.length === 1) ?
          anyData => mark(name, anyData) :
          mark(name, anyData);
      };
    };

    // Chain middleware
    stm(req, res, next);

    if (typeof next === 'function') {
      next();
    }
  };
};
