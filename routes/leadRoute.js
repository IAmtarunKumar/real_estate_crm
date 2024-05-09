const express = require("express")
const formatLeadDate = require("../function/formatedDate")

// const uniqueId = require("../function/uniqueId")
const Lead = require("../models/lead")
const router = express.Router()

const verifyToken = require("../middleware/auth")
const { User } = require("../models/user")


// testing  api
router.get("/check", async (req, res) => {
    try {
        return res.status(200).send("lead route is working")
    } catch (error) {
        console.log("error:", error)
        return res.status(500).send(`Internal server error ${error.message}`)
    }
})


//get all lead
router.get("/get", async (req, res) => {
    try {
        const allLead = await Lead.find()
        return res.status(200).send(allLead)
    } catch (error) {
        console.log(error.message)
        return res.status(500).send(`Internal server error ${error.message}`)
    }
})

//get lead by id

router.post("/leadById", async (req, res) => {
    try {
        const leadId = req.body.leadId
        const allLead = await Lead.findOne({ leadId })
        return res.status(200).send(allLead)
    } catch (error) {
        console.log(error.message)
        return res.status(500).send(`Internal server error ${error.message}`)
    }
})

//lead post
router.post("/post", verifyToken, async (req, res) => {
    const { date, status, name, email, mobile, remarks, salesExecutiveName, salesExecutiveEmail, Profession, panNumber, City, State, Address, DOB, source, PropertyType } = req.body


    // const { leadSource, name, mobile, email, message  ,payment , productName} = req.body;

    console.log("lead post req.body", req.body)
    const generateUniqueId = async () => {
        let uniqueEmployeeId = '';
        let isUnique = false;
        while (!isUnique) {
            // Generate a random 6-digit number
            const randomNumber = Math.floor(100000 + Math.random() * 900000);
            uniqueEmployeeId = randomNumber.toString();

            // Check if the generated employeeId already exists in the database
            const existingEmployee = await Lead.findOne({ employeeId: uniqueEmployeeId });

            // If the employeeId does not exist, mark it as unique
            if (!existingEmployee) {
                isUnique = true;
            }
        }
        return uniqueEmployeeId;
    };

    let leadId = await generateUniqueId()



    try {


        const dublicateLead = await Lead.findOne({ mobile })

        if (!dublicateLead) {

            const newLead = new Lead({
                // leadId ,
                // status : "New Lead",
                // date : formatLeadDate ,
                // leadSource,
                // name,
                // mobile,
                // email,
                // message,
                // payment,
                // productName,


                leadId, date: formatLeadDate, status: "New Lead", name, email, mobile, remarks, salesExecutiveName, salesExecutiveEmail, Profession, panNumber, City, State, Address, DOB, source, PropertyType


            });

            // Save the lead to the database
            await newLead.save();

            return res.status(200).send("Lead Posted Successfully")
        } else {
            // const { leadSource, name, mobile, email, message  ,payment , productName} = req.body;
            const newLead = new Lead({
                //   leadId ,
                //   status : "New Lead",
                //   date : formatLeadDate ,
                //   leadSource,
                //   name,
                //   mobile,
                //   email,
                //   message,
                //   payment,
                //   productName,
                //   dublicate : true


                leadId, date: formatLeadDate, status: "New Lead", name, email, mobile, remarks, salesExecutiveName, salesExecutiveEmail, Profession, panNumber, City, State, Address, DOB, source, PropertyType, dublicate: ture
            });

            // Save the lead to the database
            await newLead.save();

            return res.status(200).send("Lead Posted Successfully")
        }

    } catch (error) {
        console.log(error.message)
        return res.status(500).send(`Internal server error ${error.message}`)
    }
});


//lead assgin api
router.post("/leadAssign", async (req, res) => {
    try {
        let { leadIds, salesExecutiveEmail } = req.body

        for (let leadId of leadIds) {
            const foundUser = await User.findOne({ email: salesExecutiveEmail })
            const salesExecutiveName = foundUser.name
            const updatedUser = await Lead.findOneAndUpdate({ leadId }, { salesExecutiveName: salesExecutiveName, salesExecutiveEmail: salesExecutiveEmail }, {
                new: true,
            });


        }
        return res.status(200).send("Lead Assign Successfully")
    } catch (error) {
        console.log("error:", error)
        return res.status(500).send(`Internal server error ${error.message}`)
    }
})


//lead update
router.post("/update", async (req, res) => {
    console.log("lead update api calling", req.body)
    let { leadId, status, date, leadSource, name, mobile, email, message, salesExecutiveEmail, salesExecutiveName, productDetails } = req.body;
    console.log("req.body", req.body)


    try {

        let foundUser = await User.findOne({ "name": salesExecutiveName })
        if (foundUser) {
            salesExecutiveEmail = foundUser.email
        }
        // console.log("product details............" , productDetails)
        // console.log("product details rowId" , productDetails.rowId)

        const updatedUser = await Lead.findOneAndUpdate({ leadId }, { email, name, date, status, leadSource, name, mobile, message, salesExecutiveEmail, salesExecutiveName, productDetails }, {
            new: true,
        });
        if (!updatedUser) {
            return res.status(400).send("Lead not updated");
        }
        return res.status(200).send("Lead updated successfully");

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send(`Internal server error: ${error.message}`);
    }
});

//product update
router.post("/productUpdate", async (req, res) => {
    try {

        let { leadId, rowId, name, date, quantity, duration, payment, renewed } = req.body
        const foundLead = await Lead.findOne({ leadId })
        console.log("found lead", foundLead)
        const productDetails = foundLead.productDetails
        console.log("payment details", productDetails)
        let updateProductDetails = productDetails.map((data) => {

            // console.log("dataaaaaaa" , data )

            if (data.rowId === rowId) {
                console.log("if condition is working")
                data.renewed = true
            }
        })

        console.log("update", updateProductDetails)
        rowId = Math.floor(1000 + Math.random() * 9000)

        let object = { rowId, name, date, quantity, duration, payment, renewed }
        productDetails.push(object)
        const updatedUser = await Lead.findOneAndUpdate({ leadId }, { productDetails }, {
            new: true,
        });

        return res.status(200).send("Product update successfully")
    } catch (error) {
        console.log("error:", error)
        return res.status(500).send(`Internal server error ${error.message}`)
    }
})

//lead delete
router.post("/delete", async (req, res) => {

    console.log("check whats coming in body delete", req.body)
    const leadId = req.body.leadId;
    try {
        const foundUser = await Lead.findOne({ leadId })
        if (!foundUser) return res.status(400).send("Lead not found!")
        const deletedUser = await Lead.findOneAndDelete({ leadId });
        if (!deletedUser) {
            return res.status(400).send(`Lead not deleted!`);
        }
        return res.status(200).send("Lead Deleted successfully");
    } catch (error) {
        return res.status(500).send(`Internal Server Error ${error.message}`);
    }
});


module.exports = router
