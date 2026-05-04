// Wraps an async controller so any thrown / rejected error
// flows to the global Express error handler instead of crashing the process.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
