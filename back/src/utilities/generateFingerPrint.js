import crypto from "crypto";
import express from "express";
const router = express.Router();

router.use((req, res, next) => {
  // Access device info
  const deviceInfo = {
    isMobile: req.useragent.isMobile,
    isDesktop: req.useragent.isDesktop,
    isTablet: req.useragent.isTablet,
    browser: req.useragent.browser,
    version: req.useragent.version,
    os: req.useragent.os,
    platform: req.useragent.platform,
    source: req.useragent.source,
  };

  if (req.useragent.isMobile) {
    deviceInfo.deviceType = "mobile";
  } else if (req.useragent.isDesktop) {
    deviceInfo.deviceType = "desktop";
  } else if (req.useragent.isTablet) {
    deviceInfo.deviceType = "tablet";
  } else {
    deviceInfo.deviceType = "unknown";
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userIp = ip === "::1" ? "127.0.0.1" : ip;

  deviceInfo.userIp = userIp;
  req.deviceInfo = deviceInfo;

  // Create fingerprint from device info
  const fingerprintData = [
    userIp,
    req.useragent.browser,
    req.useragent.version,
    req.useragent.os,
    req.useragent.platform,
    req.headers["accept-language"] || "",
    // Additional headers that might help with identification
    req.headers["accept-encoding"] || "",
    req.headers["accept"] || "",
  ].join("|");

  // Generate hash for the fingerprint
  const fingerprint = crypto
    .createHash("sha256")
    .update(fingerprintData)
    .digest("hex");

  // Add fingerprint to the request object
  req.userFingerprint = fingerprint;
  deviceInfo.fingerprint = fingerprint;

  // this info will store in db
  req.deviceShortInfo = {
    userIp,
    browser: req.useragent.browser,
    deviceType: deviceInfo.deviceType,
  };

  next();
});

export default router;
