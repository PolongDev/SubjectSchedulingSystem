const path = require("path");
const fs = require("fs");

const editSched = async (req, res) => {
  const label = req.query.label;
  const department = req.query.department;
  const subject = req.query.subject;
  const newSched = req.query.newSched;
  if (label && department && subject) {
    try {
      const data = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "..", "database", label, `${department}.json`),
          "utf8"
        )
      );

      if (newSched) {
        let index;
        const newData = data.filter((sub, i) => {
          if (sub.subject == subject) {
            index = i;
            return false;
          }
          return true;
        });
        newData.splice(index, 0, JSON.parse(newSched));
        const updated = fs.writeFileSync(
          path.join(__dirname, "..", "database", label, `${department}.json`),
          JSON.stringify(newData)
        );
        return res.json({ response: newData, oldData: data });
      }

      const subjectSched = data.filter(sub =>
        sub.subject == subject ? true : false
      );

      res.json(subjectSched);
    } catch (e) {
      console.log(e);
    }
  } else res.json({ response: "Label, department and subject is required." });
};

const deleteSched = async (req, res) => {
  const label = req.query.label;
  const department = req.query.department;
  const subject = req.query.subject;
  if (label && department && subject) {
    try {
      const data = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "..", "database", label, `${department}.json`),
          "utf8"
        )
      );
      const newData = data.filter(sub =>
        sub.subject == subject ? false : true
      );
      const deleted = fs.writeFileSync(
        path.join(__dirname, "..", "database", label, `${department}.json`),
        JSON.stringify(newData)
      );
      res.json({ response: newData, oldData: data });
    } catch (e) {
      console.log(e);
    }
  } else res.json({ response: "Label, department and subject is required." });
};

module.exports = {
  deleteSched,
  editSched
};
