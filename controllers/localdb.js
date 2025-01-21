const path = require("path");
const fs = require("fs");

const fetchLocaldb = async (req, res) => {
  try {
    const localdbData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "localdb.json"), "utf8")
    );
    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "config.json"), "utf8")
    );
    res.json({ ...localdbData, ...config });
  } catch (e) {
    console.log(e);
  }
};

const addLocaldb = async (req, res) => {
  const collection = req.query.collection;
  let data = req.query.data;
  console.log(data, collection);
  if (data && collection) {
    try {
      const localdbData = JSON.parse(
        fs.readFileSync(path.join(__dirname, "..", "localdb.json"), "utf8")
      );
      if (collection == "rooms") data = JSON.parse(data);
      if (localdbData[collection]) {
        if (localdbData[collection].includes(data))
          return res.json(localdbData);
        localdbData[collection].push(data);
        const updated = fs.writeFileSync(
          path.join(__dirname, "..", "localdb.json"),
          JSON.stringify(localdbData)
        );
        return res.json(localdbData);
      }
      return;
    } catch (e) {
      console.log(e);
    }
  }
  res.json({ response: "Data and Collection parameter is required." });
};

const deleteLocaldb = async (req, res) => {
  const collection = req.query.collection;
  let data = req.query.data;
  console.log(data, collection);
  if (data && collection) {
    try {
      const localdbData = JSON.parse(
        fs.readFileSync(path.join(__dirname, "..", "localdb.json"), "utf8")
      );
      if (localdbData[collection]) {
        localdbData[collection] = localdbData[collection].filter((d, i) =>
          d === data ? false : true
        );
        if (collection == "rooms")
          localdbData[collection] = localdbData[collection].filter((d, i) =>
            d.name === data ? false : true
          );
        const deleted = fs.writeFileSync(
          path.join(__dirname, "..", "localdb.json"),
          JSON.stringify(localdbData)
        );
        return res.json(localdbData);
      }
      return;
    } catch (e) {
      console.log(e);
    }
  }
  res.json({ response: "Data and Collection parameter is required." });
};

module.exports = {
  fetchLocaldb,
  deleteLocaldb,
  addLocaldb
};
