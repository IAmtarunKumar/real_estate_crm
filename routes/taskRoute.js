const express = require("express");
const Task = require("../models/task");
// const Notification = require("../models/notification");
// const verifyToken = require("../middleware/auth");

const moment = require("moment");
const { User } = require("../models/user");
const verifyToken = require("../middleware/auth");
const formattedDate = require("../function/formatedDate");


const router = express.Router();

// Get all tasks
router.get("/",verifyToken, async (req, res) => {
  //all tasks of the logged in user has been found
  // const orgName = req.foundUser.orgName;
  // const userEmail = req.foundUser.email
  try {
    const allTask = await Task.find();
    if (!allTask || allTask.length === 0)
      return res.status(400).send("No Task was found!");
    res.status(200).send(allTask);
  } catch (error) {
    res.status(500).send(`Internal Server Error${error.message}`);
  }
});

// find one Task //not clear
router.post("/taskById",verifyToken, async (req, res) => {
  //
  // const orgName = req.foundUser.orgName;
  const taskId = req.body.taskId;
  try {
    const allTask = await Task.findOne({ taskId });
    if (!allTask || allTask.length === 0)
      return res.status(400).send("No Task was found!");
    return res.status(200).send(allTask);
  } catch (error) {
    res.status(500).send(`Internal Server Error${error.message}`);
  }
});

// Create an Task
router.post("/", verifyToken, async (req, res) => {

  const foundUserName = req.foundUser.name;
  const foundUserEmail = req.foundUser.email;

  console.log("req.body" , req.body)
 
  const { freshEmailSent, dueDate, clientEmail, subject, reminder, leadId } = //change the things to freshCallDate, nextCallDate
    req.body;
  if (!freshEmailSent || !dueDate || !clientEmail || !subject || !reminder)
    return res.status(400).send("please provide all the neccessary details!");

  const reminderInputDate = new Date(reminder); // Create a Date object from the given ISO string
  const ISTOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const ISTReminderDate = reminderInputDate.toISOString('en-IN', ISTOptions); // Convert to IST timezone
  //console.log("ISTReminderDate", ISTReminderDate);
  const dateObj = new Date(ISTReminderDate);
// console.log("date object" , dateObj)
  // Adjust for Indian Standard Time (IST) - UTC+5:30
  // const ISTDate = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000));

  // Extracting date in "YYYY-MM-DD" format
  const dateIST = dateObj.toISOString().split('T')[0]; // "2023-11-29"
// console.log("date in ist" , dateIST)
  // Extracting time in "HH:MM AM/PM" format
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();

  // console.log("hour min" , hours ,minutes)
  const timeIST = `${(hours < 10 ? '0' : '') + hours}:${(minutes < 10 ? '0' : '') + minutes}`;
  // console.log("timeist", timeIST)
  const reminderObject = {
    reminderDate: dateIST, reminderTime: timeIST
  }


  const newFreshEmailSent = freshEmailSent.split("T")[0]
  const newDueDate = dueDate.split("T")[0]

  // console.log("reminder object" , reminderObject)  


  // //
  const randomNumber = Math.floor(Math.random() * 900000000) + 100000000;

  // const currentDate = new Date();
  // const year = currentDate.getFullYear().toString().slice(-2); // Get the last two digits of the year
  // const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Month is 0-indexed, so add 1
  // const day = ("0" + currentDate.getDate()).slice(-2); // Get the day and pad with '0' if needed

  // const formattedDate = `${year}-${month}-${day}`;

  try {
    const newTask = new Task({
      freshEmailSent: newFreshEmailSent,
      dueDate: newDueDate,
      clientEmail,
      status: "Active",
      subject,
      reminder: reminderObject,
      leadId,
      dateCreated: formattedDate,
      taskOwner: foundUserName,
      taskOwnerEmail: foundUserEmail,
      taskId: randomNumber,
    });
    await newTask.save();
    return res.status(200).send("Task Posted Successfully");
  } catch (error) {
    return res.status(500).send(`Internal Server Error${error.message}`);
  }
});


router.post("/taskUpdate",verifyToken, async (req, res) => {
  const {
    freshEmailSent,
    dueDate,
    clientEmail,
    subject,
    reminderDate,
    reminderTime,
    leadId,
    status,
    taskId,
  } = req.body;

  if (!taskId)
    return res.status(400).send("please provide taskId for updating the task!");
  //handling the reminder, dueDate and freshEmailSentDate

  try {
    const updateTask = await Task.findOneAndUpdate(
      { taskId },
      {
        $set: {
          freshEmailSent,
          dueDate,
          clientEmail,
          subject,
          reminder: { reminderDate, reminderTime },
          leadId,
          status,
          taskId,
        },
      }
    );
    if (!updateTask) {
      return res.status(400).send(`Task not found `);
    }
    res.status(200).send("Task Updated successfully!");
  } catch (error) {
    res.status(500).send(`Internal Server Error${error.message}`);
  }
});


router.post("/delete",verifyToken, async (req, res) => {
  //console.log(req.body);
  const taskId = req.body.taskId;

  try {
    const foundTask = await Task.findOne({ taskId });
    if (!foundTask) return res.status(400).send("task not found!");
    const deletedTask = await Task.findByIdAndDelete(foundTask.id);
    if (!deletedTask) {
      return res.status(400).send(`task not deleted!`);
    }
    return res.status(200).send("Task Deleted successfully!");
  } catch (error) {
    return res.status(500).send(`Internal Server Error${error.message}`);
  }
});

//get last 30min task reminder
router.get("/remainderTask", verifyToken, async (req, res) => {
  try {
    
    const object = {};
    const email = req.foundUser.email;
  
    const allTasks = await Task.find({
      taskOwnerEmail: email,
      status: "Active",
    });

    // //console.log("All task", allTasks);
    const reminderArray = [];
    for (const task of allTasks) {
      const currentDateIST = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const { reminderDate, reminderTime } = task.reminder;

      const originalDate = new Date(reminderDate);
      const [hours, minutes] = reminderTime.split(":");

      // Add additional time to the original date
      originalDate.setUTCHours(
        originalDate.getUTCHours() + parseInt(hours, 10),
        originalDate.getUTCMinutes() + parseInt(minutes, 10)
      );

      // Format the updated date
      const formattedDate = originalDate.toISOString();

      // console.log("formattedDate", formattedDate);


      const dateObj = new Date(formattedDate);
      const reminderDateTimeIST = dateObj.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      // Convert current and reminder date strings to Date objects for comparison
      const currentDateObj = new Date(currentDateIST);
      // //console.log("currentDate Obj", currentDateObj);
      const reminderDateObj = new Date(reminderDateTimeIST);

      const dateX = moment(currentDateIST, "DD/MM/YYYY, hh:mm:ss a");
      const dateY = moment(reminderDateTimeIST, "DD/MM/YYYY, hh:mm:ss a");

      const currentDateObject = dateX.toDate();
      const reminderDateObject = dateY.toDate();
      // console.log(
      //     "reminder day",
      //     reminderDateObject.getDate(),
      //     "current",
      //     currentDateObject.getDate()
      // );
      reminderDateObject.setHours(reminderDateObject.getHours() - 5);
      reminderDateObject.setMinutes(reminderDateObject.getMinutes() - 30);

      // console.log("reminderDateObject", reminderDateObject);
      // console.log("currentDateObject", currentDateObject);
      // const aa = moment.duration(reminderDateTimeIST);
      // console.log("hour min", aa.minutes(), aa.hours());

      const isSameDate =
        (currentDateObject.getDate() === reminderDateObject.getDate() &&
          currentDateObject.getMonth() === reminderDateObject.getMonth() &&
          currentDateObject.getFullYear() ===
          reminderDateObject.getFullYear() &&
          currentDateObject.getHours() === reminderDateObject.getHours()) ||
        currentDateObject.getHours() === reminderDateObject.getHours() - 1;

    
   
      if (isSameDate) {
      
        const timeDifference =
          reminderDateObject.getTime() - currentDateObject.getTime();

        const duration = moment.duration(timeDifference);
        const durationInMinutes = duration.minutes();

        const isReminderHalfHour =
          durationInMinutes > 0 && durationInMinutes <= 30; //hour hour code changes to 10 minute now if task is 10 mins away 

        if (isReminderHalfHour) {
          reminderArray.push(task);
        }
      }
    }

    // console.log("loggingreminderarray before pushing itfinally", reminderArray);
    object.taskReminder = reminderArray;

    //
    //
    //
    return res.status(200).send(object);
  
  } catch (error) {
    return res.status(500).send(`Internal server error ${error.message}`);
  }
});

module.exports = router;
