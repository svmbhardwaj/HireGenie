/**
 * @name catchAsync
 * @description Wrap an async express handler so any rejected promise is forwarded to
 * the centralized error middleware instead of relying on a bare try/catch in every controller.
 */
function catchAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next)
    }
}


module.exports = catchAsync
