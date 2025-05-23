const notFound = (req, res, next) => {
    const message = 'Api not found';

    return res
        .status(404)
        .json({ message, success: false, error: '' });
};

export default notFound;
