const express = require("express");
const {
  fetchLocaldb,
  deleteLocaldb,
  addLocaldb
} = require("../controllers/localdb");

const router = express.Router();

router.get("/", fetchLocaldb);

router.get("/add", addLocaldb);

router.get("/delete", deleteLocaldb);

module.exports = router;
