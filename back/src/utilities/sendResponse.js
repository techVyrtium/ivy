const sendResponse = (res, payload) => {
  const { code, success, message, data } = payload || {};

  return res.status(code || 200).json({
    success: success || true,
    message: message || "",
    data: data || null,
    ...payload, // if other info added from controller/service
  });
};

export default sendResponse;
