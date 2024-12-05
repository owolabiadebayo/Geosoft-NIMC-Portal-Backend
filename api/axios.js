const axios = require("axios");
const BASE_URL = "https://geosoft-nimc-portal-backend.vercel.app/api";

module.exports = axios.create({
  baseURL: BASE_URL,
});

module.exports.axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
