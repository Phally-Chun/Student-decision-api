require("dotenv").config();

function checkServiceCode(req, res, next) {
  const serviceCode = req.headers["service-code"];
  const validServiceCodes = process.env.SERVICE_CODE;
  console.log(validServiceCodes);
  if (validServiceCodes !== serviceCode) {
    return res.status(403).json({ error: "Invalid service code" });
  }
  next();
}

module.exports = { checkServiceCode };
