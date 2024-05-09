
const mongoose = require("mongoose");

//otp verification
const verificationSchema = new mongoose.Schema({
    email: String,
    otp: Number,
});


//user schema
const userSchema = mongoose.Schema({
    email: { type: String, required: true },
    seized: { type: Boolean, required: false },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    profile: { type: String, required: true },//superAdmin/salesTl/salesExecutive/operationsTl/operationsExecutive
    password: { type: String, required: true },
    paidDateCreated: { type: String, required: false },
    orgSubscriptionAmount: { type: String, required: false },
    currentOtp: { type: String, required: false },
}, { strict: false }); //strict false because we need to dynamically add new proprties which are not defined in schema


// transection schema
const transactionSchema = new mongoose.Schema({
    status: String,
    email: String,
    firstname: String,
    productinfo: String,
    amount: Number,
    txnid: String,
    key: String,
    hash: String,
    phone: String,
});


//user model
const User = mongoose.model("User", userSchema);

// verification model
const Verification = mongoose.model(
    "Verification",
    verificationSchema
);

//transection model
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { User, Verification, Transaction };
