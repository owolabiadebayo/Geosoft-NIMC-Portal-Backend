const axios = require("axios");
const BASE_URL = "geosoft-nimc-portal-backend-gpbuo7jk7-owolabiadebayos-projects.vercel.app/api";

module.exports = axios.create({
  baseURL: BASE_URL,
});

module.exports.axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
