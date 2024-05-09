const express = require("express")
const router = express.Router()


const { User } = require("../models/user")
// const Login = require("../Login")
const bcrypt = require("bcrypt")
const { Twilio } = require("twilio");
const nodemailer = require("nodemailer");
// const Imap = require("imap");
// const { simpleParser } = requirpree("mailparser");

const verifyToken = require("../middleware/auth")
const dotenv = require("dotenv");
const Lead = require("../models/lead");
dotenv.config();



router.post("/signUp", async (req, res) => {
    console.log("signup api req.body" , req.body)
    const email = req.body.email.toLowerCase();
    const name = req.body.name;
    const mobile = req.body.mobile;
    const profile = "superAdmin";

    
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    try {
        const foundUser = await User.findOne({ email: email }).exec();
        // console.log(usr, "new user");
        // if (usr) {
        //   return res.status(400).json({ error: "Mobile Number Already Exists" });
        // }
        if (foundUser) {
            return res.status(400).json({ error: "Email Id Already Exists" });
        }
        const currentDate = new Date().toDateString();
        const newUser = new User({
            seized: false,
            name,
            email,
            mobile: mobile,
            profile,
            password: hashedPassword,
            paidDateCreated: currentDate,
            orgSubscriptionAmount: "12000",
            byeHost: "smtpout.secureserver.net",
            byePort: "587",
            officeLat: "28.59545732751747",
            officeLong: "77.32214856055862",
            userStatus: true
            //with 18%gst this will have 15 users after that we will take 1000 rs per user to add till subscription date
        });

        await newUser.save();

        return res.status(200).send("User Created Successfully!");
    } catch (error) {
        return res.status(400).send(`Internal server error ${error.message}`);
    }
});

router.post("/resetPassword", verifyToken,async (req, res) => {
    // console.log("we are in reset password", req.body)
    try {
        const { currentPassword, newPassword, confirmPassword, email } = req.body;

        const foundUser = await User.findOne({ email })


        if (!foundUser) return res.status(400).send("User not found!")
        const isPasswordMatch = await bcrypt.compare(currentPassword, foundUser.password);
        if (!isPasswordMatch) {
            return res.status(400).send("Incorrect Current password");
        }
        // Check  newPassword and confirmPassword
        if (newPassword !== confirmPassword) {
            return res
                .status(400)
                .send(
                    `New password and Confirm password do not match. Try again later!`
                );
        }



        // Hash the new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: { password: newPasswordHash } },
            { new: true }
        );
        // console.log("updatedUser", updatedUser)
        res.status(200).send(`Password reset successfully.`);
    } catch (error) {
        res.status(500).send(`Internal Server Error${error.message}`);
    }
})


router.post("/changeTeamPassword",verifyToken, async (req, res) => {
    try {
        const { newPassword, confirmPassword, email } = req.body;
        const foundUser = await User.findOne({ email })
        if (!foundUser) return res.status(400).send("Employee not found!")
        // Check  newPassword and confirmPassword
        if (newPassword !== confirmPassword) {
            return res
                .status(400)
                .send(
                    `New password and Confirm password do not match. Try again later!`
                );
        }



        // Hash the new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: { password: newPasswordHash } },
            { new: true }
        );
        // console.log("updatedUser", updatedUser)
        res.status(200).send(`Password reset successfully.`);
    } catch (error) {
        res.status(500).send(`Internal Server Error${error.message}`);
    }
})

router.post("/Update",verifyToken, async (req, res) => {
    let { email, name, profile, userStatus, newPassword, confirmPassword } = req.body;
    console.log("req.body", req.body)

    if (!email || !name || !profile) return res.status(400).send("provide all the required data!")
    try {
        if (newPassword !== undefined && confirmPassword !== undefined) {
            if (!newPassword || newPassword !== confirmPassword) {
                return res.status(400).send("New password and confirm password didn't match");
            } else {

                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
                const updatedUser = await User.findOneAndUpdate({ email }, { password: hashedPassword }, {
                    new: true,
                });
            }
        }
        if (userStatus !== undefined) {
            if (userStatus === "true") {
                userStatus = true
            } else if (userStatus === "false") {
                userStatus = false
            }
        }

        const updatedUser = await User.findOneAndUpdate({ email }, { email, name, profile, userStatus }, {
            new: true,
        });
        if (!updatedUser) {
            return res.status(400).send("User not updated");
        }

        return res.status(200).send("User updated successfully");
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send(`Internal server error: ${error.message}`);
    }
});


router.post("/delete",verifyToken, async (req, res) => {

    console.log("check whats coming in body", req.body)
    const email = req.body.email;
    try {
        const foundUser = await User.findOne({ email })
        if (!foundUser) return res.status(400).send("User not found!")
        const deletedUser = await User.findByIdAndDelete(foundUser.id);
        if (!deletedUser) {
            return res.status(400).send(`User not deleted!`);
        }
        return res.status(200).send("User Deleted successfully");
    } catch (error) {
        return res.status(500).send(`Internal Server Error-${error.message}`);
    }
});

//
//
router.get("/payNotifications", verifyToken, async (req, res) => {
    const email = req.foundUser.email;
    const mobile = req.foundUser.mobile;
    try {
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            return res.status(400).send("User not found!");
        }
        // Check if a subscription is available
        const paidDate = foundUser.paidDateCreated;
        //console.log("paid date", paidDate);
        if (paidDate) {
            const currentDate = new Date();
            const savedDate = new Date(foundUser.paidDateCreated);
            savedDate.setDate(savedDate.getDate() + 365);
            const timeDifference = Math.abs(currentDate - savedDate);
            // console.log("currentdate",currentDate,"savedDate",savedDate)
            const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

            // if (daysDifference > 335 && daysDifference <= 365) {
            if (daysDifference <= 20) {
                // console.log("day diff", daysDifference);
                return res.status(200).send(`Payment is due! Due date is ${savedDate}`);
            } else if (daysDifference > 365) {
                // console.log("Date is older than 365 days.");
                const seizedUser = await EmailUser.findOneAndUpdate(
                    { email },
                    { $set: { seized: true } }
                );
                //console.log("Check the updated seized", seizedUser);
                const twilioClient = new Twilio(
                    process.env.TWILIO_ACCOUNT_SID,
                    process.env.TWILIO_AUTH_TOKEN
                );
                const message = await twilioClient.messages.create({
                    body: `your subscription has now lapsed. kindly make a payment on the following link to reinstate access to our services. make sure to enter correct email address! - 
                    https://legalpapers-payments.onrender.com/view/initiate_payment.html`,
                    from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
                    to: `+91${mobile}`, // Number of the person you tried to reach
                });
                return res
                    .status(400)
                    .send(
                        `Your subscription, which was active until the date of ${savedDate}, has now lapsed. To reinstate access to our services, we kindly request that you proceed with the payment process which has been sent on your registered Mobile!`
                    );
            } else {
                //console.log("day diff", daysDifference);
                return res.status(200).send(null);
            }
        } else {
            return res.status(200).send(null);
        }
    } catch (error) {
        console.error("An error occurred:", error.message);
        return res.status(500).send(`Internal Server Error - ${error.message}`);
    }
});




// user post
router.post("/post", async (req, res) => {
    console.log("signup api req.body" , req.body)
    const email = req.body.email.toLowerCase();
    const name = req.body.name;
    const mobile = req.body.mobile;
    const profile =req.body.profile;
    const password = req.body.password

    
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const foundUser = await User.findOne({ email: email }).exec();

        if (foundUser) {
            return res.status(400).json({ error: "Email Id Already Exists" });
        }
        const currentDate = new Date().toDateString();
        const newUser = new User({
            name,
            email,
            mobile: mobile,
            profile,
            password: hashedPassword,
            
        });

        await newUser.save();

        return res.status(200).send("User Created Successfully!");
    } catch (error) {
        return res.status(400).send(`Internal server error ${error.message}`);
    }
});



//get all user 

router.get("/allUser" ,verifyToken, async(req,res)=>{
    try{
        let allUser = await User.find()
        return res.status(200).send(allUser)

    }catch(error){
        console.log("error:" , error)
        return res.status(500).send(`Internal server error ${error.message}`)
    }
})


//bcrytp genrate for db password changec
router.post("/password" , async(req,res)=>{
    try{
        console.log("password req.body" , req.body)
        // const bcrypt = require("bcrypt")
        let {password} = req.body
    
        const newPasswordHash = await bcrypt.hash(password, 10);
        return res.status(200).send(newPasswordHash)
    }catch(error){
        console.log("error : ", error)
        return res.status(500).send(`Internal server error ${error.message}`)
    }
})






module.exports = router