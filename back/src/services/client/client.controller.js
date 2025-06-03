import mongoose from "mongoose";
import { Client } from "../../models/client.model.js";
import catchAsync from "../../utilities/catchAsync.js";
import emailBodyMessage from "../../utilities/emailBodyMessage.js";
import { generateNewToken } from "../../utilities/extractOrGenerateSessionId.js";
import sendEmail from "../../utilities/sendEmail.js";
import sendResponse from "../../utilities/sendResponse.js";
import setCookiesAndSendResponse from "../../utilities/setCookiesAndSendResponse.js";

// create a new client
export const createClient = catchAsync(async (req, res, next) => {
  const deviceShortInfo = req.deviceShortInfo;
  const token_data = await generateNewToken("verified", "user");

  const data = req.body || {};

  const {
    name,
    phoneNumber,
    email,
    client_code,
    country,
    industry,
    budgetRange,

    language,
    deliveryTime,
    businessTypes,
    otherBusinessType,
  } = data || {};
  if (
    !name ||
    !phoneNumber ||
    !email ||
    !client_code ||
    !deliveryTime ||
    !businessTypes
  ) {
    return next({
      message:
        "Name, phone number, email, client code, delivery time, and business types are required",
      code: 400,
    });
  }

  const isClientExist = await Client.findOne({
    $or: [{ phoneNumber }, { email }],
  });

  if (isClientExist) {
    return next({
      message: "Client with this phone number or email already exists",
      code: 400,
    });
  }

  const newClientData = {
    session_id: token_data.sessionId,
    name,
    phoneNumber,
    email,
    country,
    industry,
    budgetRange,
    personType: "natural",
    cus_code: client_code,
    language,
    deliveryTime,
    businessTypes,
    otherBusinessType,
    deviceInfo: deviceShortInfo,
  };

  const newClient = await Client.create(newClientData);

  await sendEmail({
    email: email,
    subject: "IVY Secret Key",
    body: emailBodyMessage(newClient._id),
  });

  return setCookiesAndSendResponse(res, {
    code: 201,
    success: true,
    message: "Client created successfully",
    data: newClient,
    token: token_data,
  });
});

// Change device for an existing client
export const changeDevice = catchAsync(async (req, res, next) => {
  const token_data = await generateNewToken("verified", "user");

  const data = req.body || {};

  const { email, securityKey } = data || {};
  if (!email || !securityKey) {
    return next({
      message: "Email and secret key are required",
      code: 400,
    });
  }

  const user_id = securityKey.replace("secret_key_", "");

  // Validate if the extracted user_id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    return next({
      message: "Invalid security key",
      code: 400,
    });
  }

  const isClientExist = await Client.findById(user_id);
  if (!isClientExist) {
    return next({
      message: "Wrong secret key",
      code: 400,
    });
  }

  if (isClientExist.email !== email) {
    return next({
      message: "Email does not match with the secret key",
      code: 400,
    });
  }

  // setting old sessionId to the new token data so that the client can continue using the same session from multiple devices
  token_data.sessionId = isClientExist.session_id;

  return setCookiesAndSendResponse(res, {
    code: 200,
    success: true,
    message: "Client created successfully",
    data: isClientExist,
    token: token_data,
  });
});

export const createClientThroughN8N = catchAsync(async (req, res, next) => {
  const { mongoDBUpdateData } = req.body || {};

  // let client = await Client.findOne({ fingerprint });
  // console.log(req.body);

  // data.fingerprint = fingerprint;
  // data.deviceInfo = deviceShortInfo;

  // if (client) {
  //   client = await Client.findByIdAndUpdate(
  //     client._id,
  //     { $set: data },
  //     { new: true }
  //   );
  // } else {
  //   client = await Client.create(data);
  // }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: "Client created",
  });
});

export const getAllClients = catchAsync(async (req, res, next) => {
  const clients = await Client.find();

  return sendResponse(res, {
    code: 200,
    success: true,
    message: "Get all client",
    data: clients,
    deviceInfo: req.deviceInfo,
  });
});
