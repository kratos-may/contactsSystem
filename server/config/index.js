if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
module.exports = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  FRONT_URL: process.env.FRONT_URL,
  SEED: process.env.SEED,
  EXP: process.env.EXP,
  URL_DB: process.env.URL_DB,
};