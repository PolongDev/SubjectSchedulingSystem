const fs = require("fs");
const path = require("path");
const { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableCell, 
  TableRow, 
  TextRun, 
  WidthType, 
  AlignmentType
} = require("docx");

const generateDocument = async (req, res) => {
  try {
    const tableRow = [
      new TableRow({
        children: [
          new TableCell({
            width: {
              size: 2350,
              type: WidthType.DXA,
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Subject",
                    bold: true,
                  })
                ],
                alignment: AlignmentType.CENTER,
            })
            ],
          }),
          new TableCell({
            width: {
                  size: 2100,
                  type: WidthType.DXA,
              },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Time",
                    bold: true,
                  })
                ],
                alignment: AlignmentType.CENTER,
            })
            ],
          }),
          new TableCell({
            width: {
                size: 1500,
                type: WidthType.DXA,
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Room",
                    bold: true,
                  })
                ],
                alignment: AlignmentType.CENTER,
            })
            ],
          }),
          new TableCell({
            width: {
                  size: 1300,
                  type: WidthType.DXA,
              },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Day",
                    bold: true,
                  })
                ],
                alignment: AlignmentType.CENTER,
            })
            ],
          }),
          new TableCell({
              width: {
                    size: 1950,
                    type: WidthType.DXA,
                },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Instructor",
                      bold: true,
                    })
                  ],
                  alignment: AlignmentType.CENTER,
              })
              ],
            }),
        ],
    }),
    ];
  
    const schedules = JSON.parse(req.query.scheduleData);
    schedules.map((schedule, index) => {
      const row = new TableRow({
        children: [
            new TableCell({
                width: {
                    size: 2350,
                    type: WidthType.DXA,
                },
                children: [new Paragraph({
                        text: schedule.subject,
                        alignment: AlignmentType.CENTER,
                      })],
            }),
            new TableCell({
                width: {
                    size: 2100,
                    type: WidthType.DXA,
                },
                children: [new Paragraph({
                        text: `${schedule.time.start[0]}:${schedule.time.start[1] > 0 ? schedule.time.start[1] : String(schedule.time.start[1]) + "0"} - ${schedule.time.end[0]}:${schedule.time.end[1] > 0 ? schedule.time.end[1] : String(schedule.time.end[1]) + "0"} ${schedule.timeStatus}`,
                        alignment: AlignmentType.CENTER,
                      })],
            }),
            new TableCell({
                width: {
                    size: 1500,
                    type: WidthType.DXA,
                },
                children: [new Paragraph({
                        text: schedule.room,
                        alignment: AlignmentType.CENTER,
                      })],
            }),
            new TableCell({
                width: {
                    size: 1300,
                    type: WidthType.DXA,
                },
                children: [new Paragraph({
                        text: schedule.day.length == 1 ?
                          schedule.day[0].slice(0,3) :
                          schedule.day.length == 2 && schedule.day.includes("Monday") && schedule.day.includes("Wednesday") ?
                          "MW" :
                          schedule.day.length == 2 && schedule.day.includes("Tuesday") && schedule.day.includes("Thursday") ?
                          "TTH" :
                          schedule.day.length > 2 && schedule.day.includes("Monday") && schedule.day.includes("Wednesday") ?
                          `MW, ${schedule.day.filter((e) => e == "Monday" || e == "Wednesday" ? false : true).map(d => d.slice(0, 3)).join(", ")}` :
                          schedule.day.length > 2 && schedule.day.includes("Tuesday") && schedule.day.includes("Thursday") ?
                          `TTH, ${schedule.day.filter((e) => e == "Tuesday" || e == "Thursday" ? false : true).map(d => d.slice(0, 3)).join(", ")}` :
                          schedule.day.map(d => d.slice(0, 3)).join(", "),
                        alignment: AlignmentType.CENTER,
                      })],
            }),
            new TableCell({
                width: {
                    size: 1950,
                    type: WidthType.DXA,
                },
                children: [new Paragraph({
                        text: schedule.instructor,
                        alignment: AlignmentType.CENTER,
                      })],
            }),
        ],
      });
      
      tableRow.push(row)
    });
  
    const table = new Table({
        rows: [...tableRow],
    });
  
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `CodeBuddy Solutions\n${req.query.department} Schedule\n`,
                bold: true,
              })
            ],
            alignment: AlignmentType.CENTER,
        }),
        table],
      }]
    });
  
    Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(path.join(__dirname, "..", "documents", `${req.query.department}.docx`), buffer);
        console.log("success");
        res.sendFile(path.join(__dirname, "..", "documents", `${req.query.department}.docx`), (err) => {
          if (err) {
            console.log(err);
          }
          console.log("File sent!");
        })
    });
  } catch (e) {console.log(e)}
}

module.exports = { generateDocument };