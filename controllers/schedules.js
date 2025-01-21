const fs = require("fs");
const path = require("path");

const getAllScheduleLabels = async (req, res) => {
  try {
    const labels = fs.readdirSync(path.join(__dirname, "..", "database"));
    if (!labels) return res.json({ response: "Internal Server Error." });
    res.json({ response: labels });
  } catch (e) {
    console.log(e);
  }
};

const createScheduleLabel = async (req, res) => {
  try {
    await fs.mkdir(
      path.join(__dirname, "..", "database", req.query.label.trim()),
      err => {
        if (err) {
          console.log(err);
          res.json({ status: "failed" });
          return;
        } else {
          res.json({ status: "success" });
        }
      }
    );
  } catch (e) {
    console.log(e);
  }
};

const getAllDepartmentSched = async (req, res) => {
  fs.readdir(
    path.join(__dirname, "..", "database", req.query.label),
    (err, files) => {
      if (err) {
        res.json({ response: "Error." });
        return;
      }
      res.json({ response: files });
    }
  );
};

const createDepartmentSched = async (req, res) => {
  try {
    if (
      !fs.existsSync(
        path.join(
          __dirname,
          "..",
          "database",
          req.query.label.trim(),
          `${req.query.department.trim()}.json`
        )
      )
    ) {
      await fs.writeFileSync(
        path.join(
          __dirname,
          "..",
          "database",
          req.query.label.trim(),
          `${req.query.department.trim()}.json`
        ),
        ""
      );
      res.json({ status: "success" });
    } else {
      console.log("File already exist.");
      res.json({ status: "failed" });
    }
  } catch (e) {
    console.log(e);
  }
};

const createSchedJSON = async (req, res) => {
  if (
    !fs.existsSync(
      path.join(
        __dirname,
        "..",
        "database",
        req.query.label,
        req.query.department
      )
    )
  ) {
    return res.json({ status: "failed" });
  }
  try {
    fs.readdir(path.join(__dirname, "..", "database"), (err, folders) => {
      if (err) {
        console.log("may Error boss", err);
        return;
      }
      for (let i = 0; i < folders.length; i++) {
        if (folders[i] == req.query.label) {
          console.log("J");
          fs.readdir(
            path.join(__dirname, "..", "database", req.query.label),
            (err, files) => {
              if (err) {
                console.log("may Error boss", err);
                return;
              }
              for (let i = 0; i < files.length; i++) {
                if (files[i] == req.query.department) {
                  fs.writeFileSync(
                    path.join(
                      __dirname,
                      "..",
                      "database",
                      req.query.label,
                      req.query.department
                    ),
                    req.query.schedjson
                  );
                  res.json({ status: "success" });
                }
              }
            }
          );
        }
      }
    });
  } catch (e) {
    console.log(`May Error boss hehe ${e}`);
  }
};

const getScheduleData = async (req, res) => {
  try {
    const data = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "database",
        req.query.label,
        req.query.department
      ),
      "utf8"
    );
    res.json({ response: data });
  } catch (e) {
    console.log(e);
  }
};

const getDepartmentSchedData = async (req, res) => {
  let departmentData = [];
  try {
    fs.readdir(path.join(__dirname, "..", "database"), (err, folders) => {
      if (err) return console.log(e);
      for (let i = 0; i < folders.length; i++) {
        if (folders[i] == req.query.label) {
          fs.readdir(
            path.join(__dirname, "..", "database", req.query.label),
            (err, files) => {
              for (let i = 0; i < files.length; i++) {
                const file = fs.readFileSync(
                  path.join(
                    __dirname,
                    "..",
                    "database",
                    req.query.label,
                    files[i]
                  ),
                  "utf8"
                );
                if (file != "") {
                  departmentData.push(JSON.parse(file));
                }
              }

              res.json({ response: departmentData });
            }
          );
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
};

const deleteSchedLabel = async (req, res) => {
  if (!fs.existsSync(path.join(__dirname, "..", "database", req.query.label))) {
    return res.json({ success: false });
  }
  try {
    fs.rmSync(
      path.join(__dirname, "..", "database", req.query.label),
      { recursive: true, force: true },
      err => {}
    );
    console.log(`${req.query.label} is  deleted!`);
    res.json({ success: true });
  } catch (e) {
    console.log(`${req.query.label} is not deleted!`);
  }
};

const deleteDepartmentSched = async (req, res) => {
  if (
    !fs.existsSync(
      path.join(
        __dirname,
        "..",
        "database",
        req.query.label,
        `${req.query.department}.json`
      )
    )
  ) {
    return res.json({ success: false });
  }

  try {
    fs.unlinkSync(
      path.join(
        __dirname,
        "..",
        "database",
        req.query.label,
        `${req.query.department}.json`
      )
    );
    return res.json({ success: true });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getAllScheduleLabels,
  createScheduleLabel,
  getAllDepartmentSched,
  createDepartmentSched,
  createSchedJSON,
  getScheduleData,
  getDepartmentSchedData,
  deleteSchedLabel,
  deleteDepartmentSched
};
