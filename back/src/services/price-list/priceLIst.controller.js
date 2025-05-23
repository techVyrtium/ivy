import { Client } from "../../models/client.model.js";
import { PriceList } from "../../models/priceList.model.js";
import catchAsync from "../../utilities/catchAsync.js";
import sendResponse from "../../utilities/sendResponse.js";

export const createPriceListItem = catchAsync(async (req, res, next) => {
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

export const getPriceList = catchAsync(async (req, res, next) => {
  const { currentPage, limit, search } = req.query || {};

  const page = Number(currentPage || 1);
  const documentLimit = Number(limit || 10);

  const priceList = await PriceList.find()
    .skip((page - 1) * documentLimit)
    .limit(documentLimit);

  const totalDocuments = await PriceList.countDocuments();

  return sendResponse(res, {
    code: 200,
    success: true,
    message: "Retrieved price list",
    data: {
      currentPage: page,
      limit: documentLimit,
      totalPages: Math.ceil(totalDocuments / documentLimit),
      totalDocuments,
      priceList,
    },
  });
});
