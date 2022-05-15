const Playoff = require("./playoff.js");
const Db = require("./database.js");

const PASSWORD = process.env["PASSWORD"];
const USER = process.env["USER"];

var __cachedToken = null;

const app = (module.exports = {
  login: async () => Playoff.login(USER, PASSWORD),

  getCachedToken: () => {
    if (!__cachedToken) return null;
    
    const time = new Date().getTime();
    if (time - __cachedToken.time < 60000){
      return __cachedToken.token;
    }
    return null;
    
  },

  setCachedToken: async (token) => {
    const time = new Date().getTime();
    __cachedToken = {token, time}
  },

  getToken: async () => {
    const cachedToken = await app.getCachedToken();

    if (cachedToken) {
      return cachedToken;
    }

    const token = await app.login();
    app.setCachedToken(token);

    return token;
  },
});
