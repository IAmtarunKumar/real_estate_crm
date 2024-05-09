const mongoose = require("mongoose");


const taskSchema = new mongoose.Schema({
    freshEmailSent: {
        type: String,
        required: false,
    },
    dueDate: {
        type: String,
        required: false,
    },
    clientEmail: {
        type: String,
        required: false,
    },
    status: {  //this is automatically set when someone create a task
        type: String,
        enum: ["Active", "Completed"],
        default: "Active",
    },
    subject: {
        type: String,
    },
    reminder: {
        reminderDate: {
            type: String,
        },
        reminderTime: {
            type: String,
        },
    },
    leadId: { //it must be blank if its not related to lead
        type: Number,
        required: false,
    },  //lead Id
    dateCreated: {
        type: String,
        required: true,
    },

    // clientPhoneNumber: {
    //     type: String,
    //     required: true,
    // },

    taskOwner: {
        type: String,
        required: true,
    },

    taskOwnerEmail: {
        type: String,
        required: true,
    },


    taskId: { type: Number, required: true }
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
