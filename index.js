const dotenv = require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 3500;

// middlewares
app.use((req, res, next) => {
  console.log(req.path);
  next();
});
app.use(cors());
app.use(express.json());

// routes
app.use("/sched", require("./routes/static"));
app.use("/api", require("./routes/schedules"));
app.use("/api/action", require("./routes/actions"));
app.use("/api/localdb", require("./routes/localdb"));
app.use("/api/document", require("./routes/document"));
app.use(express.static(path.join(__dirname, "public")));

// landing page
app.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// 404 page
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "404.html"))
);

// run the server
app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
