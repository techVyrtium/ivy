const globalErrorHandler = (error, req, res, next) => {
  const statuscode = error?.code || 500;
  const message =
    error?.message?.message ||
    error?.message?.error ||
    error?.message ||
    error ||
    "Something went wrong";

  console.log("error: ", error);

  return res.status(statuscode).json({ message, success: false, error });
};

export default globalErrorHandler;
