import { Client } from "../../models/client.model.js";
import catchAsync from "../../utilities/catchAsync.js";
import sendResponse from "../../utilities/sendResponse.js";

export const createClient = catchAsync(async (req, res, next) => {
  const fingerprint = req.userFingerprint;
  const deviceShortInfo = req.deviceShortInfo;

  let client = await Client.findOne({ fingerprint });

  const data = req.body || {};
  data.fingerprint = fingerprint;
  data.deviceInfo = deviceShortInfo;

  if (client) {
    client = await Client.findByIdAndUpdate(
      client._id,
      { $set: data },
      { new: true }
    );
  } else {
    client = await Client.create(data);
  }

  return sendResponse(res, {
    code: 200,
    success: true,
    message: "Client created",
    data: client,
    deviceInfo: req.deviceInfo,
  });
});

export const createClientThroughN8N = catchAsync(async (req, res, next) => {
  const { mongoDBUpdateData } = req.body || {};

  // let client = await Client.findOne({ fingerprint });
  console.log(req.body);

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
