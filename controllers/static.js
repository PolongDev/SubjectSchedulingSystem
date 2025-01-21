const fs = require("fs");
const path = require("path");

const configData = async (req, res) => {
  const collection = req.params.collection.toLowerCase();
  const localdbData = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "localdb.json"), "utf8"));
  if (!localdbData[collection]) return res.sendFile(path.join(__dirname, "..", "views", "404.html"));
  res.sendFile(path.join(__dirname, "..", "views", "config.html"));
}

const labelsPage = async (req, res) => {
  const label = req.params.label;
  try {
    fs.readdir(path.join(__dirname, "..", "database"), (err, folders) => {
      if(folders.includes(label)){
        return res.sendFile(path.join(__dirname, "..", "views", "addDepartment.html"));
      }
      res.status(404).sendFile(path.join(__dirname, "..", "views", "404.html"));
    })
  } catch (e) {console.log(e)}
}

const departmentsPage = async (req, res) => {
  try {
    fs.readdir(path.join(__dirname, "..", "database"), (err, folders) => {
      if(folders.includes(req.params.label)){
        fs.readdir(path.join(__dirname, "..", "database", req.params.label), (err, files) => {
          if(files.includes(`${req.params.department}.json`)){
            res.sendFile(path.join(__dirname, "..", "views", "addSchedule.html"));
          }else{
            res.sendFile(path.join(__dirname, "..", "views", "404.html"));
          }
        })
      }else{
        res.sendFile(path.join(__dirname, "..", "views", "404.html"));
      }
    })
  } catch (e) {console.log(e)}
}

const notFound = async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "404.html"));
}

module.exports = {
  labelsPage,
  departmentsPage,
  configData,
  notFound,
}