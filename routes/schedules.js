const express = require("express");
const schedules = express.Router();

const {
  getAllScheduleLabels,
  createScheduleLabel,
  createDepartmentSched,
  getAllDepartmentSched,
  createSchedJSON,
  getScheduleData,
  getDepartmentSchedData,
  deleteSchedLabel,
  deleteDepartmentSched
} = require("../controllers/schedules");

// api requests
schedules.get("/getAllSchedLabel", getAllScheduleLabels);

schedules.get("/createSchedLabel", createScheduleLabel);

schedules.get("/getAllDepartmentSched", getAllDepartmentSched);

schedules.get("/createDepartmentSched", createDepartmentSched);

schedules.get("/createSchedJSON", createSchedJSON);

schedules.get("/getScheduleData", getScheduleData);

schedules.get("/getDepartmentSchedData", getDepartmentSchedData);

schedules.get("/deleteSchedLabel", deleteSchedLabel);

schedules.get("/deleteDepartmentSched", deleteDepartmentSched);

module.exports = schedules;