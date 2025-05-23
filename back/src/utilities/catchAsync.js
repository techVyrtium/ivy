// for handling asynchronous function e.g. try catch
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.log({ error })
            next(error)
        });
    };
};

export default catchAsync;
