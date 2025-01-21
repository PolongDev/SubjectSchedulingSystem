const express = require("express");
const staticSite = express.Router();
const {
  labelsPage,
  departmentsPage,
  configData,
  notFound,
} = require("../controllers/static");

staticSite.get('/config/:collection', configData)

staticSite.get('/data/:label', labelsPage);

staticSite.get("/addsched/:label/depart/:department", departmentsPage);

staticSite.get("*", notFound);

module.exports = staticSite;