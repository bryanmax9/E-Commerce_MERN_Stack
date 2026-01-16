const { expressjwt } = require("express-jwt");
require("dotenv/config");
const api = process.env.API_URL;

function authJwt() {
  return expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      // Allow public access to uploaded images (static files are served from /public/uploads/)
      { url: /^\/public\/uploads\/.*/, methods: ["GET", "OPTIONS"] },
      // Allow GET requests to products and categories without authentication
      { url: new RegExp(`${api}/products(.*)`), methods: ["GET", "OPTIONS"] },
      { url: new RegExp(`${api}/categories(.*)`), methods: ["GET", "OPTIONS"] },
      // Allow login and register
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}

async function isRevoked(req, token) {
  // In express-jwt v8, the second parameter is the full decoded token object
  // The actual payload data is nested in token.payload
  const payload = token.payload;

  // Return true to revoke token, false to allow
  // If isAdmin is not present or is false, revoke the token
  if (!payload || payload.isAdmin !== true) {
    return true; // Revoke token
  }
  return false; // Allow token for admins
}

module.exports = authJwt;
