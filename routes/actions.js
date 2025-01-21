const express = require("express");
const actions = express.Router();
const { deleteSched, editSched } = require("../controllers/actions");

actions.get("/editSched", editSched);

actions.get("/deleteSched", deleteSched);

module.exports = actions;
