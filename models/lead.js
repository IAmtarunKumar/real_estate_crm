
const mongoose = require("mongoose");


const remarks = mongoose.Schema({
  date : {type : String , required : false},
  message : {type : String , required : false}
})

const siteVisit = mongoose.Schema({
  date : {type : String , required : false},
  site : {type : String , required : false},
  executiveName : {type : String , required : false},
  status : {type : String , required : false}
})


const booking = mongoose.Schema({
  date : {type : String , required : false},
  site : {type : String , required : false},
  executiveName : {type : String , required : false},
  status : {type : String , required : false},
  
})

const leadSchema = mongoose.Schema({
  // leadId: { type: String, required: true },
  // status: { type: String, required: false },
  // date: { type: String, required: true },
  // leadSource: { type: String, required: false },

  // name: { type: String, required: false },
  // mobile: { type: String, required: false },
  // email: { type: String, required: false },
  // message: { type: String, required: false },


  // productDetails: [productDetails],
  // salesExecutiveName: { type: String, required: false },
  // salesExecutiveEmail: { type: String, required: false },
  // dublicate : { type: Boolean , required: false },
  // productQty: { type: String, required: false },
  // duration: { type: String, required: false },
  // payment: { type: String, required: false },


  leadId: { type: String, required: true },
  status: { type: String, required: false },
  date: { type: String, required: true },
  name: { type: String, required: false },
  email: { type: String, required: false },
  mobile: { type: String, required: false },
  remarks: [remarks],  // 

  salesExecutiveName: { type: String, required: false },
  salesExecutiveEmail: { type: String, required: false },
  dublicate: { type: Boolean, required: false },

  profession: { type: String, required: false },
  panNumber: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  address: { type: String, required: false },
  DOB: { type: String, required: false },
  source: { type: String, required: false },
  propertyType: { type: String, required: false },

  siteVisit : [siteVisit],
  booking : [booking]

  //pending 
  //add document in crm


});

const Lead = mongoose.model("lead", leadSchema);

module.exports = Lead;


