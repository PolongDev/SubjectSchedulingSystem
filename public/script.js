const contents = document.querySelector(".contents");
const addBtn = document.querySelector(".addButton");
const subject = document.querySelector(".addSubject");
const room = document.querySelector(".room");
const instructor = document.querySelector(".instructor");
const option = document.querySelector(".option");
const editContainer = document.querySelector(".editSubjectContainer");
const checkboxes = document.querySelectorAll(".editDay");
const editSubject = document.querySelector(".editSubject");
const editSHours = document.querySelector(".editSHours");
const editSMinutes = document.querySelector(".editSMinutes");
const editEHours = document.querySelector(".editEHours");
const editEMinutes = document.querySelector(".editEMinutes");
const editOption = document.querySelector(".editOption");
const editInstructor = document.querySelector(".editInstructor");
const editRoom = document.querySelector(".editRoom");

const toggleMenu = document.querySelector(".toggleMenu");
const menuBtn = document.querySelector(".menuBtn");
const menuIcon = document.querySelector(".menuIcon");

menuBtn.onclick = () => {
  toggleMenu.classList.toggle("toggle");
  toggleIcon();
};

const SHours = document.querySelector(".SHours");
const SMinutes = document.querySelector(".SMinutes");
const EHours = document.querySelector(".EHours");
const EMinutes = document.querySelector(".EMinutes");
const popupBoxContainer = document.querySelector(".popupBoxContainer");
const popupBoxContainer2 = document.querySelector(".popupBoxContainer2");
const popupBoxInfo = document.querySelector(".popupBoxInfo");

const urlPath = window.location.href;
const labelName = urlPath.slice(
  urlPath.indexOf("/sched/") + 16,
  urlPath.indexOf("/depart")
);
const url = urlPath.slice(0, urlPath.indexOf("/sched/"));
const department = urlPath.slice(urlPath.indexOf("depart") + 7);

document.querySelector(".h3LabelName").innerHTML = `${decodeURI(
  department
)} Schedule <button class="deleteBtn"><i class="fa-solid fa-trash-can"></i></button>`;

// Links
for (let i = 0; i < 2; i++) {
  document.querySelectorAll(".homeLink")[i].setAttribute("href", url);
  document
    .querySelectorAll(".subjectsLink")
    [i].setAttribute("href", `${url}/sched/config/Subjects`);
  document
    .querySelectorAll(".roomsLink")
    [i].setAttribute("href", `${url}/sched/config/Rooms`);
  document
    .querySelectorAll(".instructorsLink")
    [i].setAttribute("href", `${url}/sched/config/Instructors`);
}

let schedule = [],
  localdb;

function showPopup2(message, func) {
  document.querySelector(".popupBoxInfo2").innerHTML = message;
  document.querySelector(".deleteLabel").onclick = () => func();
  popupBoxContainer2.style.display = "block";
}

function popUpTextMeme(msg) {
  if (!localdb.memeText.status) return;
  const randomMeme = localdb.memeText.randomMeme;
  const memeText =
    msg || randomMeme[Math.floor(Math.random() * randomMeme.length)];
  for (let i = 0; i < 5; i++) {
    const popUpText = document.createElement("div");
    popUpText.className = "popUpTextMeme";
    popUpText.textContent = memeText;
    popUpText.style.top = `${Math.random() * 90}vh`;
    popUpText.style.left = `${Math.random() * 90}vw`;
    document.body.appendChild(popUpText);
    setTimeout(() => popUpText.remove(), 3000);
  }
}

function closePopup() {
  popupBoxContainer2.style.display = "none";
  popUpTextMeme();
}

function toggleIcon() {
  menuIcon.classList.toggle("fa-xmark");
  menuIcon.classList.toggle("fa-bars");
}

async function deleteDepartment() {
  const res = await fetch(
    `${url}/api/deleteDepartmentSched?label=${labelName}&department=${department}`
  );
  const data = await res.json();

  if (data.success) {
    window.location.href = `${url}/sched/data/${labelName}`;
  } else {
    alert(`${decodeURI(department)} schedule already deleted!`);
  }

  closePopup();
}

// function to send and save the data to the server
async function saveScheduleToDatabase(url, labelName, department, schedule) {
  const response = await fetch(
    `${url}/api/createSchedJSON?label=${labelName}&department=${department}.json&schedjson=${JSON.stringify(
      schedule
    )}`
  );
  const data = await response.json();
  if (data.status == "success") {
    console.log(`Schedule added to the database successfully.`);
  } else {
    alert(
      `Error: ${decodeURI(
        department
      )} Schedule does not exist in the database! Please create a new department schedule and close this one :)`
    );
  }
}

// checks if there is a conflict schedule using isConflictSchedule and isAllSchedConflict function.
async function conflictChecker(sched, editMode = false) {
  if (schedule.length > 0) {
    const conflict = await isConflictSchedule(sched, editMode);
    if (conflict) return conflict;
    schedule.push(sched);
  } else {
    const conflictAll = await isAllSchedConflict(sched, editMode);
    if (conflictAll) return conflictAll;
    schedule.push(sched);
  }
}

// function that checks if the new subject's time and room already exist in the current department schedule.
async function isConflictSchedule(SCHED, editMode) {
  let status = false;
  if (SCHED.day.length > 1) {
    for (let y = 0; y < SCHED.day.length; y++) {
      if (status) break;
      // checks if there's a conflict with the current schedule
      for (let i = 0; i < schedule.length; i++) {
        if (status) break;
        if (
          editMode &&
          SCHED.subject === schedule[i].subject &&
          SCHED.department === schedule[i].department
        )
          continue;
        if (schedule[i].day.length == 1) {
          // checks if STARTING time and room has conflict
          if (
            SCHED.time.start[0] >= schedule[i].time.start[0] &&
            SCHED.time.start[0] < schedule[i].time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[y] === schedule[i].day[0] &&
            SCHED.timeStatus === schedule[i].timeStatus
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
            status = true;
            break;
          } else if (
            SCHED.time.end[0] == 12 &&
            SCHED.time.start[0] >= schedule[i].time.start[0] &&
            SCHED.time.start[0] < schedule[i].time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[y] === schedule[i].day[0]
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
            status = true;
            break;
          } else if (
            SCHED.time.start[0] == schedule[i].time.end[0] &&
            SCHED.time.start[1] < schedule[i].time.end[1] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[y] === schedule[i].day[0] &&
            SCHED.timeStatus === schedule[i].timeStatus
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
            status = true;
            break;
          } else if (
            SCHED.time.end[0] == 12 &&
            SCHED.time.start[0] == schedule[i].time.end[0] &&
            SCHED.time.start[1] < schedule[i].time.end[1] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[y] === schedule[i].day[0]
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
            status = true;
            break;

            // checks if CLOSING time and room has conflict
          } else if (
            SCHED.time.end[0] > schedule[i].time.start[0] &&
            SCHED.time.end[0] < schedule[i].time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[y] === schedule[i].day[0] &&
            SCHED.timeStatus === schedule[i].timeStatus
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
            status = true;
            break;
          } else if (
            schedule[i].time.end[0] == 12 &&
            SCHED.time.end[0] > schedule[i].time.start[0] &&
            SCHED.time.end[0] < schedule[i].time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[y] === schedule[i].day[0]
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
            status = true;
            break;
          } else if (
            SCHED.time.end[0] == schedule[i].time.start[0] &&
            SCHED.time.end[1] > schedule[i].time.start[1] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[y] === schedule[i].day[0] &&
            SCHED.timeStatus === schedule[i].timeStatus
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
            status = true;
            break;
          } else if (
            schedule[i].time.end[0] == 12 &&
            SCHED.time.end[0] == schedule[i].time.start[0] &&
            SCHED.time.end[1] > schedule[i].time.start[1] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[y] === schedule[i].day[0]
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
            status = true;
            break;

            // checks if time RANGE and room has conflict
          } else if (
            schedule[i].time.start[0] > SCHED.time.start[0] &&
            schedule[i].time.start[0] < SCHED.time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[y] === schedule[i].day[0] &&
            SCHED.timeStatus === schedule[i].timeStatus
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Time Range with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
            status = true;
            break;
          } else if (
            SCHED.time.end[0] == 12 &&
            schedule[i].time.start[0] > SCHED.time.start[0] &&
            schedule[i].time.start[0] < SCHED.time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[y] === schedule[i].day[0]
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Time Range with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
            status = true;
            break;
          } else {
            status = false;
          }
        } else {
          for (let x = 0; x < schedule[i].day.length; x++) {
            // checks if STARTING time and room has conflict
            if (
              SCHED.time.start[0] >= schedule[i].time.start[0] &&
              SCHED.time.start[0] < schedule[i].time.end[0] &&
              SCHED.room === schedule[i].room &&
              SCHED.day[y] === schedule[i].day[x] &&
              SCHED.timeStatus === schedule[i].timeStatus
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
              status = true;
              break;
            } else if (
              SCHED.time.end[0] == 12 &&
              SCHED.time.start[0] >= schedule[i].time.start[0] &&
              SCHED.time.start[0] < schedule[i].time.end[0] &&
              SCHED.room === schedule[i].room &&
              SCHED.day[y] === schedule[i].day[x]
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
              status = true;
              break;
            } else if (
              SCHED.time.start[0] == schedule[i].time.end[0] &&
              SCHED.time.start[1] < schedule[i].time.end[1] &&
              SCHED.room === schedule[i].room &&
              SCHED.day[y] === schedule[i].day[x] &&
              SCHED.timeStatus === schedule[i].timeStatus
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
              status = true;
              break;
            } else if (
              SCHED.time.end[0] == 12 &&
              SCHED.time.start[0] == schedule[i].time.end[0] &&
              SCHED.time.start[1] < schedule[i].time.end[1] &&
              SCHED.room === schedule[i].room &&
              SCHED.day[y] === schedule[i].day[x]
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
              status = true;
              break;

              // checks if CLOSING time and room has conflict
            } else if (
              SCHED.time.end[0] > schedule[i].time.start[0] &&
              SCHED.time.end[0] < schedule[i].time.end[0] &&
              SCHED.room === schedule[i].room &&
              SCHED.day[y] === schedule[i].day[x] &&
              SCHED.timeStatus === schedule[i].timeStatus
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
              status = true;
              break;
            } else if (
              schedule[i].time.end[0] == 12 &&
              SCHED.time.end[0] > schedule[i].time.start[0] &&
              SCHED.time.end[0] < schedule[i].time.end[0] &&
              SCHED.room === schedule[i].room &&
              SCHED.day[y] === schedule[i].day[x]
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
              status = true;
              break;
            } else if (
              SCHED.time.end[0] == schedule[i].time.start[0] &&
              SCHED.time.end[1] > schedule[i].time.start[1] &&
              SCHED.room === schedule[i].room &&
              SCHED.day[y] === schedule[i].day[x] &&
              SCHED.timeStatus === schedule[i].timeStatus
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
              status = true;
              break;
            } else if (
              schedule[i].time.end[0] == 12 &&
              SCHED.time.end[0] == schedule[i].time.start[0] &&
              SCHED.time.end[1] > schedule[i].time.start[1] &&
              SCHED.room === schedule[i].room &&
              SCHED.day[y] === schedule[i].day[x]
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
              status = true;
              break;

              // checks if time RANGE and room has conflict
            } else if (
              schedule[i].time.start[0] > SCHED.time.start[0] &&
              schedule[i].time.start[0] < SCHED.time.end[0] &&
              SCHED.room === schedule[i].room &&
              SCHED.day[y] === schedule[i].day[x] &&
              SCHED.timeStatus === schedule[i].timeStatus
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Time Range with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
              status = true;
              break;
            } else if (
              SCHED.time.end[0] == 12 &&
              schedule[i].time.start[0] > SCHED.time.start[0] &&
              schedule[i].time.start[0] < SCHED.time.end[0] &&
              SCHED.room === schedule[i].room &&
              SCHED.day[y] === schedule[i].day[x]
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Time Range with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
              status = true;
              break;
            } else {
              status = false;
            }
          }
        }
      }
    }
  } else {
    // checks if there's a conflict with the current schedule
    for (let i = 0; i < schedule.length; i++) {
      if (status) break;
      if (
        editMode &&
        SCHED.subject === schedule[i].subject &&
        SCHED.department === schedule[i].department
      )
        continue;
      if (schedule[i].day.length == 1) {
        // checks if STARTING time and room has conflict
        if (
          SCHED.time.start[0] >= schedule[i].time.start[0] &&
          SCHED.time.start[0] < schedule[i].time.end[0] &&
          SCHED.room === schedule[i].room &&
          SCHED.day[0] === schedule[i].day[0] &&
          SCHED.timeStatus === schedule[i].timeStatus
        ) {
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
          status = true;
          break;
        } else if (
          SCHED.time.end[0] == 12 &&
          SCHED.time.start[0] >= schedule[i].time.start[0] &&
          SCHED.time.start[0] < schedule[i].time.end[0] &&
          SCHED.room === schedule[i].room &&
          SCHED.day[0] === schedule[i].day[0]
        ) {
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
          status = true;
          break;
        } else if (
          SCHED.time.start[0] == schedule[i].time.end[0] &&
          SCHED.time.start[1] < schedule[i].time.end[1] &&
          SCHED.room === schedule[i].room &&
          SCHED.day[0] === schedule[i].day[0] &&
          SCHED.timeStatus === schedule[i].timeStatus
        ) {
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
          status = true;
          break;
        } else if (
          SCHED.time.end[0] == 12 &&
          SCHED.time.start[0] == schedule[i].time.end[0] &&
          SCHED.time.start[1] < schedule[i].time.end[1] &&
          SCHED.room === schedule[i].room &&
          SCHED.day[0] === schedule[i].day[0]
        ) {
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
          status = true;
          break;

          // checks if CLOSING time and room has conflict
        } else if (
          SCHED.time.end[0] > schedule[i].time.start[0] &&
          SCHED.time.end[0] < schedule[i].time.end[0] &&
          SCHED.room === schedule[i].room &&
          SCHED.day[0] === schedule[i].day[0] &&
          SCHED.timeStatus === schedule[i].timeStatus
        ) {
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
          status = true;
          break;
        } else if (
          schedule[i].time.end[0] == 12 &&
          SCHED.time.end[0] > schedule[i].time.start[0] &&
          SCHED.time.end[0] < schedule[i].time.end[0] &&
          SCHED.room === schedule[i].room &&
          SCHED.day[0] === schedule[i].day[0]
        ) {
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
          status = true;
          break;
        } else if (
          SCHED.time.end[0] == schedule[i].time.start[0] &&
          SCHED.time.end[1] > schedule[i].time.start[1] &&
          SCHED.room === schedule[i].room &&
          SCHED.day[0] === schedule[i].day[0] &&
          SCHED.timeStatus === schedule[i].timeStatus
        ) {
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
          status = true;
          break;
        } else if (
          schedule[i].time.end[0] == 12 &&
          SCHED.time.end[0] == schedule[i].time.start[0] &&
          SCHED.time.end[1] > schedule[i].time.start[1] &&
          SCHED.room === schedule[i].room &&
          SCHED.day[0] === schedule[i].day[0]
        ) {
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
          status = true;
          break;

          // checks if time RANGE and room has conflict
        } else if (
          schedule[i].time.start[0] > SCHED.time.start[0] &&
          schedule[i].time.start[0] < SCHED.time.end[0] &&
          SCHED.room === schedule[i].room &&
          SCHED.day[0] === schedule[i].day[0] &&
          SCHED.timeStatus === schedule[i].timeStatus
        ) {
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Time Range with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
          status = true;
          break;
        } else if (
          SCHED.time.end[0] == 12 &&
          schedule[i].time.start[0] > SCHED.time.start[0] &&
          schedule[i].time.start[0] < SCHED.time.end[0] &&
          SCHED.room === schedule[i].room &&
          SCHED.day[0] === schedule[i].day[0]
        ) {
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Time Range with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[0]}`;
          status = true;
          break;
        } else {
          status = false;
        }
      } else {
        for (let x = 0; x < schedule[i].day.length; x++) {
          // checks if STARTING time and room has conflict
          if (
            SCHED.time.start[0] >= schedule[i].time.start[0] &&
            SCHED.time.start[0] < schedule[i].time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[0] === schedule[i].day[x] &&
            SCHED.timeStatus === schedule[i].timeStatus
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
            status = true;
            break;
          } else if (
            SCHED.time.end[0] == 12 &&
            SCHED.time.start[0] >= schedule[i].time.start[0] &&
            SCHED.time.start[0] < schedule[i].time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[0] === schedule[i].day[x]
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
            status = true;
            break;
          } else if (
            SCHED.time.start[0] == schedule[i].time.end[0] &&
            SCHED.time.start[1] < schedule[i].time.end[1] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[0] === schedule[i].day[x] &&
            SCHED.timeStatus === schedule[i].timeStatus
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
            status = true;
            break;
          } else if (
            SCHED.time.end[0] == 12 &&
            SCHED.time.start[0] == schedule[i].time.end[0] &&
            SCHED.time.start[1] < schedule[i].time.end[1] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[0] === schedule[i].day[x]
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
            status = true;
            break;

            // checks if CLOSING time and room has conflict
          } else if (
            SCHED.time.end[0] > schedule[i].time.start[0] &&
            SCHED.time.end[0] < schedule[i].time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[0] === schedule[i].day[x] &&
            SCHED.timeStatus === schedule[i].timeStatus
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
            status = true;
            break;
          } else if (
            schedule[i].time.end[0] == 12 &&
            SCHED.time.end[0] > schedule[i].time.start[0] &&
            SCHED.time.end[0] < schedule[i].time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[0] === schedule[i].day[x]
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
            status = true;
            break;
          } else if (
            SCHED.time.end[0] == schedule[i].time.start[0] &&
            SCHED.time.end[1] > schedule[i].time.start[1] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[0] === schedule[i].day[x] &&
            SCHED.timeStatus === schedule[i].timeStatus
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
            status = true;
            break;
          } else if (
            schedule[i].time.end[0] == 12 &&
            SCHED.time.end[0] == schedule[i].time.start[0] &&
            SCHED.time.end[1] > schedule[i].time.start[1] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[0] === schedule[i].day[x]
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
            status = true;
            break;

            // checks if time RANGE and room has conflict
          } else if (
            schedule[i].time.start[0] > SCHED.time.start[0] &&
            schedule[i].time.start[0] < SCHED.time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[0] === schedule[i].day[x] &&
            SCHED.timeStatus === schedule[i].timeStatus
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Time Range with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
            status = true;
            break;
          } else if (
            SCHED.time.end[0] == 12 &&
            schedule[i].time.start[0] > SCHED.time.start[0] &&
            schedule[i].time.start[0] < SCHED.time.end[0] &&
            SCHED.room === schedule[i].room &&
            SCHED.day[0] === schedule[i].day[x]
          ) {
            popupBoxContainer.style.display = "block";
            popupBoxInfo.innerHTML = `Conflict Time Range with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day[x]}`;
            status = true;
            break;
          } else {
            status = false;
          }
        }
      }
    }
  }

  // checks if there's a conflict with all department schedules
  if (!status) {
    status = await isAllSchedConflict(SCHED, editMode);
  }

  return status;
}

// function that checks if the new subject's time and room already exist in all department schedules.
async function isAllSchedConflict(SCHED, editMode) {
  try {
    let partialStatus;
    const response = await fetch(
      `${url}/api/getDepartmentSchedData?label=${labelName}`
    );
    const data = await response.json();
    const schedData = data.response;

    for (let i = 0; i < schedData.length; i++) {
      if (SCHED.day.length > 1) {
        for (let z = 0; z < SCHED.day.length; z++) {
          for (let x = 0; x < schedData[i].length; x++) {
            if (
              editMode &&
              SCHED.subject === schedData[i][x].subject &&
              SCHED.department === schedData[i][x].department
            )
              continue;
            if (schedData[i][x].day.length == 1) {
              // checks if STARTING time and room has conflict
              if (
                SCHED.time.start[0] >= schedData[i][x].time.start[0] &&
                SCHED.time.start[0] < schedData[i][x].time.end[0] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[z] === schedData[i][x].day[0] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                SCHED.time.end[0] == 12 &&
                SCHED.time.start[0] >= schedData[i][x].time.start[0] &&
                SCHED.time.start[0] < schedData[i][x].time.end[0] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[z] === schedData[i][x].day[0]
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                SCHED.time.start[0] == schedData[i][x].time.end[0] &&
                SCHED.time.start[1] < schedData[i][x].time.end[1] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[z] === schedData[i][x].day[0] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                SCHED.time.end[0] == 12 &&
                SCHED.time.start[0] == schedData[i][x].time.end[0] &&
                SCHED.time.start[1] < schedData[i][x].time.end[1] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[z] === schedData[i][x].day[0]
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
                return true;

                // checks if CLOSING time and room has conflict
              } else if (
                SCHED.time.end[0] > schedData[i][x].time.start[0] &&
                SCHED.time.end[0] < schedData[i][x].time.end[0] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[z] === schedData[i][x].day[0] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                (schedData[i][x].time.end[0] =
                  12 &&
                  SCHED.time.end[0] > schedData[i][x].time.start[0] &&
                  SCHED.time.end[0] < schedData[i][x].time.end[0] &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[z] === schedData[i][x].day[0])
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                SCHED.time.end[0] == schedData[i][x].time.start[0] &&
                SCHED.time.end[1] > schedData[i][x].time.start[1] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[z] === schedData[i][x].day[0] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                (schedData[i][x].time.end[0] =
                  12 &&
                  SCHED.time.end[0] == schedData[i][x].time.start[0] &&
                  SCHED.time.end[1] > schedData[i][x].time.start[1] &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[z] === schedData[i][x].day[0])
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
                return true;

                // checks if time RANGE and room has conflict
              } else if (
                schedData[i][x].time.start[0] > SCHED.time.start[0] &&
                schedData[i][x].time.start[0] < SCHED.time.end[0] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[z] === schedData[i][x].day[0] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Time Range with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                SCHED.time.end[0] == 12 &&
                schedData[i][x].time.start[0] > SCHED.time.start[0] &&
                schedData[i][x].time.start[0] < SCHED.time.end[0] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[z] === schedData[i][x].day[0] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Time Range with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else {
                partialStatus = false;
              }
            } else {
              const end = schedData[i][x].time.end[0];
              for (let y = 0; y < schedData[i][x].day.length; y++) {
                // checks if STARTING time and room has conflict
                if (
                  SCHED.time.start[0] >= schedData[i][x].time.start[0] &&
                  SCHED.time.start[0] < end &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[0] === schedData[i][x].day[y] &&
                  SCHED.timeStatus === schedData[i][x].timeStatus
                ) {
                  popupBoxContainer.style.display = "block";
                  popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                  return true;
                } else if (
                  SCHED.time.end[0] == 12 &&
                  SCHED.time.start[0] >= schedData[i][x].time.start[0] &&
                  SCHED.time.start[0] < end &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[0] === schedData[i][x].day[y]
                ) {
                  popupBoxContainer.style.display = "block";
                  popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                  return true;
                } else if (
                  SCHED.time.start[0] == end &&
                  SCHED.time.start[1] < schedData[i][x].time.end[1] &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[0] === schedData[i][x].day[y] &&
                  SCHED.timeStatus === schedData[i][x].timeStatus
                ) {
                  popupBoxContainer.style.display = "block";
                  popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                  return true;
                } else if (
                  SCHED.time.end[0] == 12 &&
                  SCHED.time.start[0] == end &&
                  SCHED.time.start[1] < schedData[i][x].time.end[1] &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[0] === schedData[i][x].day[y]
                ) {
                  popupBoxContainer.style.display = "block";
                  popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                  return true;

                  // checks if CLOSING time and room has conflict
                } else if (
                  SCHED.time.end[0] > schedData[i][x].time.start[0] &&
                  SCHED.time.end[0] < end &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[0] === schedData[i][x].day[y] &&
                  SCHED.timeStatus === schedData[i][x].timeStatus
                ) {
                  popupBoxContainer.style.display = "block";
                  popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                  return true;
                } else if (
                  end == 12 &&
                  SCHED.time.end[0] > schedData[i][x].time.start[0] &&
                  SCHED.time.end[0] < end &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[0] === schedData[i][x].day[y]
                ) {
                  popupBoxContainer.style.display = "block";
                  popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                  return true;
                } else if (
                  SCHED.time.end[0] == schedData[i][x].time.start[0] &&
                  SCHED.time.end[1] > schedData[i][x].time.start[1] &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[0] === schedData[i][x].day[y] &&
                  SCHED.timeStatus === schedData[i][x].timeStatus
                ) {
                  popupBoxContainer.style.display = "block";
                  popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                  return true;
                } else if (
                  end == 12 &&
                  SCHED.time.end[0] == schedData[i][x].time.start[0] &&
                  SCHED.time.end[1] > schedData[i][x].time.start[1] &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[0] === schedData[i][x].day[y]
                ) {
                  popupBoxContainer.style.display = "block";
                  popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                  return true;

                  // checks if time RANGE and room has conflict
                } else if (
                  schedData[i][x].time.start[0] > SCHED.time.start[0] &&
                  schedData[i][x].time.start[0] < SCHED.time.end[0] &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[0] === schedData[i][x].day[y] &&
                  SCHED.timeStatus === schedData[i][x].timeStatus
                ) {
                  popupBoxContainer.style.display = "block";
                  popupBoxInfo.innerHTML = `Conflict Time Range with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                  return true;
                } else if (
                  SCHED.time.end[0] == 12 &&
                  schedData[i][x].time.start[0] > SCHED.time.start[0] &&
                  schedData[i][x].time.start[0] < SCHED.time.end[0] &&
                  SCHED.room === schedData[i][x].room &&
                  SCHED.day[0] === schedData[i][x].day[y] &&
                  SCHED.timeStatus === schedData[i][x].timeStatus
                ) {
                  popupBoxContainer.style.display = "block";
                  popupBoxInfo.innerHTML = `Conflict Time Range with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                  return true;
                } else {
                  partialStatus = false;
                }
              }
            }
          }
        }
      } else {
        for (let x = 0; x < schedData[i].length; x++) {
          if (
            editMode &&
            SCHED.subject === schedData[i][x].subject &&
            SCHED.department === schedData[i][x].department
          )
            continue;
          if (schedData[i][x].day.length == 1) {
            // checks if STARTING time and room has conflict
            if (
              SCHED.time.start[0] >= schedData[i][x].time.start[0] &&
              SCHED.time.start[0] < schedData[i][x].time.end[0] &&
              SCHED.room === schedData[i][x].room &&
              SCHED.day[0] === schedData[i][x].day[0] &&
              SCHED.timeStatus === schedData[i][x].timeStatus
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[0]} in ${schedData[i][x].department} Schedule.`;
              return true;
            } else if (
              SCHED.time.end[0] == 12 &&
              SCHED.time.start[0] >= schedData[i][x].time.start[0] &&
              SCHED.time.start[0] < schedData[i][x].time.end[0] &&
              SCHED.room === schedData[i][x].room &&
              SCHED.day[0] === schedData[i][x].day[0]
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[0]} in ${schedData[i][x].department} Schedule.`;
              return true;
            } else if (
              SCHED.time.start[0] == schedData[i][x].time.end[0] &&
              SCHED.time.start[1] < schedData[i][x].time.end[1] &&
              SCHED.room === schedData[i][x].room &&
              SCHED.day[0] === schedData[i][x].day[0] &&
              SCHED.timeStatus === schedData[i][x].timeStatus
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[0]} in ${schedData[i][x].department} Schedule.`;
              return true;
            } else if (
              SCHED.time.end[0] == 12 &&
              SCHED.time.start[0] == schedData[i][x].time.end[0] &&
              SCHED.time.start[1] < schedData[i][x].time.end[1] &&
              SCHED.room === schedData[i][x].room &&
              SCHED.day[0] === schedData[i][x].day[0]
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[0]} in ${schedData[i][x].department} Schedule.`;
              return true;

              // checks if CLOSING time and room has conflict
            } else if (
              SCHED.time.end[0] > schedData[i][x].time.start[0] &&
              SCHED.time.end[0] < schedData[i][x].time.end[0] &&
              SCHED.room === schedData[i][x].room &&
              SCHED.day[0] === schedData[i][x].day[0] &&
              SCHED.timeStatus === schedData[i][x].timeStatus
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[0]} in ${schedData[i][x].department} Schedule.`;
              return true;
            } else if (
              (schedData[i][x].time.end[0] =
                12 &&
                SCHED.time.end[0] > schedData[i][x].time.start[0] &&
                SCHED.time.end[0] < schedData[i][x].time.end[0] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[0])
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[0]} in ${schedData[i][x].department} Schedule.`;
              return true;
            } else if (
              SCHED.time.end[0] == schedData[i][x].time.start[0] &&
              SCHED.time.end[1] > schedData[i][x].time.start[1] &&
              SCHED.room === schedData[i][x].room &&
              SCHED.day[0] === schedData[i][x].day[0] &&
              SCHED.timeStatus === schedData[i][x].timeStatus
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[0]} in ${schedData[i][x].department} Schedule.`;
              return true;
            } else if (
              (schedData[i][x].time.end[0] =
                12 &&
                SCHED.time.end[0] == schedData[i][x].time.start[0] &&
                SCHED.time.end[1] > schedData[i][x].time.start[1] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[0])
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[0]} in ${schedData[i][x].department} Schedule.`;
              return true;

              // checks if time RANGE and room has conflict
            } else if (
              schedData[i][x].time.start[0] > SCHED.time.start[0] &&
              schedData[i][x].time.start[0] < SCHED.time.end[0] &&
              SCHED.room === schedData[i][x].room &&
              SCHED.day[0] === schedData[i][x].day[0] &&
              SCHED.timeStatus === schedData[i][x].timeStatus
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Time Range with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[0]} in ${schedData[i][x].department} Schedule.`;
              return true;
            } else if (
              SCHED.time.end[0] == 12 &&
              schedData[i][x].time.start[0] > SCHED.time.start[0] &&
              schedData[i][x].time.start[0] < SCHED.time.end[0] &&
              SCHED.room === schedData[i][x].room &&
              SCHED.day[0] === schedData[i][x].day[0] &&
              SCHED.timeStatus === schedData[i][x].timeStatus
            ) {
              popupBoxContainer.style.display = "block";
              popupBoxInfo.innerHTML = `Conflict Time Range with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[0]} in ${schedData[i][x].department} Schedule.`;
              return true;
            } else {
              partialStatus = false;
            }
          } else {
            const end = schedData[i][x].time.end[0];
            for (let y = 0; y < schedData[i][x].day.length; y++) {
              // checks if STARTING time and room has conflict
              if (
                SCHED.time.start[0] >= schedData[i][x].time.start[0] &&
                SCHED.time.start[0] < end &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[y] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                SCHED.time.end[0] == 12 &&
                SCHED.time.start[0] >= schedData[i][x].time.start[0] &&
                SCHED.time.start[0] < end &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[y]
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                SCHED.time.start[0] == end &&
                SCHED.time.start[1] < schedData[i][x].time.end[1] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[y] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                SCHED.time.end[0] == 12 &&
                SCHED.time.start[0] == end &&
                SCHED.time.start[1] < schedData[i][x].time.end[1] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[y]
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                return true;

                // checks if CLOSING time and room has conflict
              } else if (
                SCHED.time.end[0] > schedData[i][x].time.start[0] &&
                SCHED.time.end[0] < end &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[y] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                end == 12 &&
                SCHED.time.end[0] > schedData[i][x].time.start[0] &&
                SCHED.time.end[0] < end &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[y]
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                SCHED.time.end[0] == schedData[i][x].time.start[0] &&
                SCHED.time.end[1] > schedData[i][x].time.start[1] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[y] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                end == 12 &&
                SCHED.time.end[0] == schedData[i][x].time.start[0] &&
                SCHED.time.end[1] > schedData[i][x].time.start[1] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[y]
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                return true;

                // checks if time RANGE and room has conflict
              } else if (
                schedData[i][x].time.start[0] > SCHED.time.start[0] &&
                schedData[i][x].time.start[0] < SCHED.time.end[0] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[y] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Time Range with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else if (
                SCHED.time.end[0] == 12 &&
                schedData[i][x].time.start[0] > SCHED.time.start[0] &&
                schedData[i][x].time.start[0] < SCHED.time.end[0] &&
                SCHED.room === schedData[i][x].room &&
                SCHED.day[0] === schedData[i][x].day[y] &&
                SCHED.timeStatus === schedData[i][x].timeStatus
              ) {
                popupBoxContainer.style.display = "block";
                popupBoxInfo.innerHTML = `Conflict Time Range with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day[y]} in ${schedData[i][x].department} Schedule.`;
                return true;
              } else {
                partialStatus = false;
              }
            }
          }
        }
      }
    }
    return partialStatus;
  } catch (e) {
    console.log(e);
  }
}

// function that loads schedule data from specific department
async function loadSchedules() {
  const response = await fetch(
    `${url}/api/getScheduleData?label=${labelName}&department=${department}.json`
  );
  const data = await response.json();
  try {
    contents.innerHTML = "";
    document.querySelector(".nodata").style.display = "block";
    schedule = JSON.parse(data.response);
    console.log(schedule);
    if (schedule.length > 0) {
      document.querySelector(".nodata").style.display = "none";
      for (let i = 0; i < schedule.length; i++) {
        contents.innerHTML += `
          <tr>
            <td>${schedule[i].subject}</td>
            <td>
              ${schedule[i].time?.start[0]}:${
                schedule[i].time?.start[1] > 0
                  ? schedule[i].time?.start[1]
                  : String(schedule[i].time?.start[1]) + "0"
              } - ${schedule[i].time?.end[0]}:${
                schedule[i].time?.end[1] > 0
                  ? schedule[i].time?.end[1]
                  : String(schedule[i].time?.end[1]) + "0"
              } ${schedule[i].timeStatus}
            </td>
            <td>${schedule[i].room}</td>
            <td>${
              schedule[i].day.length == 1
                ? schedule[i].day[0].slice(0, 3)
                : schedule[i].day.length == 2 &&
                  schedule[i].day.includes("Monday") &&
                  schedule[i].day.includes("Wednesday")
                ? "MW"
                : schedule[i].day.length == 2 &&
                  schedule[i].day.includes("Tuesday") &&
                  schedule[i].day.includes("Thursday")
                ? "TTH"
                : schedule[i].day.length > 2 &&
                  schedule[i].day.includes("Monday") &&
                  schedule[i].day.includes("Wednesday")
                ? `MW, ${schedule[i].day
                    .filter(e =>
                      e == "Monday" || e == "Wednesday" ? false : true
                    )
                    .map(d => d.slice(0, 3))
                    .join(", ")}`
                : schedule[i].day.length > 2 &&
                  schedule[i].day.includes("Tuesday") &&
                  schedule[i].day.includes("Thursday")
                ? `TTH, ${schedule[i].day
                    .filter(e =>
                      e == "Tuesday" || e == "Thursday" ? false : true
                    )
                    .map(d => d.slice(0, 3))
                    .join(", ")}`
                : schedule[i].day.map(d => d.slice(0, 3)).join(", ")
            }</td>
            <td>${schedule[i].instructor}</td>
            <td class="actionsContainer">
              <div class="actions">
                <button class="editAction" onclick="actionEdit(this)">
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button class="deleteAction" onclick="actionDelete(this)">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>`;
      }
    }
  } catch (e) {
    console.log(e);
  }
}

// function that loads all data from localdb file that can be used in datalist
async function loadLocaldbData() {
  const response = await fetch(`${url}/api/localdb`);
  const data = await response.json();
  localdb = data;
}

// function that prompts the user to delete a subject
async function actionDelete(event) {
  const subject =
    event.parentElement.parentElement.parentElement.firstElementChild.innerText;

  const fireActionDelete = async () => {
    try {
      const response = await fetch(
        `${url}/api/action/deleteSched?label=${labelName}&department=${department}&subject=${subject}`
      );
      await loadSchedules();
      closePopup();
    } catch (e) {
      console.log(e);
    }
  };

  showPopup2(
    `Are you sure you want to delete <span style="color:red;">${subject}</span> subject?`,
    fireActionDelete
  );
}

// function that prompts the user to edit a subject schedule
async function actionEdit(event) {
  const subjectName =
    event.parentElement.parentElement.parentElement.firstElementChild.innerText;
  const response = await fetch(
    `${url}/api/action/editSched?label=${labelName}&department=${department}&subject=${subjectName}`
  );
  const data = await response.json();

  // utilizes the data received into the edit form
  editSubject.value = data[0].subject;
  editSHours.value = data[0].time.start[0];
  editSMinutes.value = data[0].time.start[1];
  editEHours.value = data[0].time.end[0];
  editEMinutes.value = data[0].time.end[1];
  editOption.value = data[0].timeStatus;
  editInstructor.value = data[0].instructor;
  editRoom.value = data[0].room;

  let daySelected = [...data[0].day];

  for (let checkbox of checkboxes) {
    if (daySelected.includes(checkbox.value)) checkbox.checked = true;
  }

  editContainer.style.display = "block";

  // this is a callback function that saves the edited schedule from actionEdit function
  document.querySelector(".saveEditBtn").onclick = async () => {
    let newDaySelected = [];
    for (let checkbox of checkboxes) {
      if (checkbox.checked) newDaySelected.push(checkbox.value);
    }

    if (
      newDaySelected.length < 1 ||
      editSubject.value == "" ||
      editSHours.value == "" ||
      editSMinutes.value == "" ||
      editEHours.value == "" ||
      editEMinutes.value == "" ||
      editOption.value == "" ||
      editRoom.value == "" ||
      editInstructor.value == ""
    )
      return (document.querySelector(".fillout2").style.display = "block");

    let newSched = {
      department: department.trim(),
      subject: editSubject.value.trim(),
      time: {
        start: [
          Number(editSHours.value),
          editSMinutes.value == "" ? 0 : Number(editSMinutes.value)
        ],
        end: [
          Number(editEHours.value),
          editEMinutes.value == "" ? 0 : Number(editEMinutes.value)
        ]
      },
      timeStatus: editOption.value,
      day: newDaySelected,
      room: editRoom.value.trim(),
      instructor: editInstructor.value.trim()
    };

    const changedDays =
      data[0].day.length === newDaySelected.length
        ? newDaySelected.map((day, i) => day === data[0].day[i])
        : [false];
    const possibleConflict =
      Number(editSHours.value) === data[0].time.start[0] &&
      Number(editSMinutes.value) === data[0].time.start[1] &&
      Number(editEHours.value) === data[0].time.end[0] &&
      Number(editEMinutes.value) === data[0].time.end[1] &&
      editOption.value === data[0].timeStatus &&
      !changedDays.includes(false) &&
      editRoom.value === data[0].room;
    if (!possibleConflict) {
      if (await conflictChecker(newSched, true)) return;
    }

    const response = await fetch(
      `${url}/api/action/editSched?label=${labelName}&department=${department}&subject=${subjectName}&newSched=${JSON.stringify(
        newSched
      )}`
    );

    // closes the edit popup
    document.querySelector(".cancelEditBtn").click();

    // reload the schedules
    await loadSchedules();
    popUpTextMeme();
  };
}

// download the document file
async function ExportAsDoc() {
  const response = await fetch(
    `${url}/api/document/generate?scheduleData=${JSON.stringify(
      schedule
    )}&department=${department}`
  );
  const data = await response.blob();
  console.log(data);
  const link = await window.URL.createObjectURL(new Blob([data]));
  const a = await document.createElement("a");
  a.href = link;
  a.download = `${decodeURI(department)}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// this is a callback function executed everytime the site loads
window.onload = async () => {
  await loadSchedules();
  await loadLocaldbData();

  // utilizes the data from localdb into the datalists
  localdb.subjects.map(
    subj =>
      (document.querySelector(
        "#subjects"
      ).innerHTML += `<option value="${subj}">${subj}</option>`)
  );
  localdb.instructors.map(
    instr =>
      (document.querySelector(
        "#instructors"
      ).innerHTML += `<option value="${instr}">${instr}</option>`)
  );
  localdb.rooms.map(
    room =>
      (document.querySelector(
        "#rooms"
      ).innerHTML += `<option value="${room.value}">${room.name}</option>`)
  );
  localdb.rooms.map(
    room =>
      (document.querySelector(
        ".editRoom"
      ).innerHTML += `<option value="${room.value}">${room.name}</option>`)
  );
};

// this is a callback function executed only when the addBtn is clicked
addBtn.onclick = async () => {
  const input = document.querySelectorAll("input");
  const fillout = document.querySelector(".fillout");
  let selectedDay = [];

  const days = document.querySelectorAll('input[type="checkbox"]');

  for (let day of days) {
    if (day.checked) selectedDay.push(day.value);
  }

  // creates an array loop, used to identify if all the input fields are filled.
  let inputStatus = [];

  if (
    subject.value === "" ||
    SHours.value === "" ||
    SMinutes.value === "" ||
    EHours.value === "" ||
    EMinutes.value === "" ||
    room.value === "" ||
    instructor.value === "" ||
    selectedDay.length < 1
  )
    inputStatus.push(false);

  // for(let i = 0; i < input.length; i++){
  //   input[i].value !== "" ? inputStatus.push(true) : inputStatus.push(false);
  // }

  // checks if all the inputs are filled
  if (!inputStatus.includes(false)) {
    let sched = {
      department: department.trim(),
      subject: subject.value.trim(),
      time: {
        start: [
          Number(SHours.value),
          SMinutes.value == "" ? 0 : Number(SMinutes.value)
        ],
        end: [
          Number(EHours.value),
          EMinutes.value == "" ? 0 : Number(EMinutes.value)
        ]
      },
      timeStatus: option.value,
      day: selectedDay,
      room: room.value.trim(),
      instructor: instructor.value.trim()
    };

    // checks if end time is greater than start time
    if (sched.time.start[0] >= sched.time.end[0]) {
      document.querySelector(".popupBoxContainer").style.display = "block";
      document.querySelector(
        ".popupBoxInfo"
      ).innerHTML = `Closing time should be greater than Starting time.`;
      return;
    }

    const conflicted = await conflictChecker(sched);

    if (conflicted) return;

    document.querySelector(".nodata").style.display = "none";
    contents.innerHTML += `
      <tr>
        <td>${subject.value}</td>
        <td>
          ${SHours.value}:${
            SMinutes.value > 0 ? SMinutes.value : String(SMinutes.value) + "0"
          } - ${EHours.value}:${
            EMinutes.value > 0 ? EMinutes.value : String(EMinutes.value) + "0"
          } ${option.value}
        </td>
        <td>${room.value}</td>
        <td>${
          selectedDay.length == 1
            ? selectedDay[0].slice(0, 3)
            : selectedDay.length == 2 &&
              selectedDay.includes("Monday") &&
              selectedDay.includes("Wednesday")
            ? "MW"
            : selectedDay.length == 2 &&
              selectedDay.includes("Tuesday") &&
              selectedDay.includes("Thursday")
            ? "TTH"
            : selectedDay.length > 2 &&
              selectedDay.includes("Monday") &&
              selectedDay.includes("Wednesday")
            ? `MW, ${selectedDay
                .filter(e => (e == "Monday" || e == "Wednesday" ? false : true))
                .map(d => d.slice(0, 3))
                .join(", ")}`
            : selectedDay.length > 2 &&
              selectedDay.includes("Tuesday") &&
              selectedDay.includes("Thursday")
            ? `TTH, ${selectedDay
                .filter(e => (e == "Tuesday" || e == "Thursday" ? false : true))
                .map(d => d.slice(0, 3))
                .join(", ")}`
            : selectedDay.map(d => d.slice(0, 3)).join(", ")
        }</td>
          
        <td>${instructor.value}</td>
        <td class="actionsContainer">
          <div class="actions">
            <button class="editAction" onclick="actionEdit(this)">
              <i class="fa-solid fa-edit"></i>
            </button>
            <button class="deleteAction" onclick="actionDelete(this)">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;

    subject.value = "";
    instructor.value = "";
    room.value = "";
    SHours.value = "";
    SMinutes.value = "";
    EHours.value = "";
    EMinutes.value = "";
    for (let day of days) day.checked = false;
    fillout.style.display = "none";
    saveScheduleToDatabase(url, labelName, department, schedule);
  } else {
    return (fillout.style.display = "block");
  }
  console.log(schedule);
};

// this is a callback function that prompts the user before the deletion of department schedule
document.querySelector(".deleteBtn").onclick = () => {
  const message = `Are you sure you want to delete <span style="color:red">${decodeURI(
    department
  )} schedule</span>?`;
  showPopup2(message, deleteDepartment);
};

// close the popupBoxContainer when click
document.querySelector(".popupButton").onclick = () => {
  document.querySelector(".popupBoxContainer").style.display = "none";
};

// this is a callback function that closes the popup edit container
document.querySelector(".cancelEditBtn").onclick = () => {
  editContainer.style.display = "none";

  for (let checkbox of checkboxes) {
    checkbox.checked = false;
  }

  popUpTextMeme();
};
