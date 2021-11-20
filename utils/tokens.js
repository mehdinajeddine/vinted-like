const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const generateSalt = () => {
  return uid2(16);
};

const generateHash = (str) => {
  return SHA256(str).toString(encBase64);
};

const generateToken = () => {
  return uid2(16);
};

module.exports = { generateSalt, generateHash, generateToken };
