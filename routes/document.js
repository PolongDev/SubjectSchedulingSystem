const express = require("express");
const document = express.Router();

const { generateDocument } = require("../controllers/document");

document.get("/generate", generateDocument);

module.exports = document;
