const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Twilio } = require("twilio");

const { User } = require("./models/user");
const dotenv = require("dotenv");
dotenv.config();


async function Login(req, res) {
    // console.log("we are in login and checking inbody", req.body)
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("Please provide all the details!")


    const userData = await User.findOne({ email: email.toLowerCase() })

    if (!userData) {
        return res.status(400).send("Invalid login username");
    }
    // console.log("user data", userData)

    // // let mobileLoginData
    const currentDate = new Date()

    const year = currentDate.getFullYear().toString().slice(-2); // Get the last two digits of the year
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Month is 0-indexed, so add 1
    const day = ('0' + currentDate.getDate()).slice(-2); // Get the day and pad with '0' if needed

    const formattedDate = `${year}-${month}-${day}`;

    // console.log(formattedDate);

    try {
        const mobile = userData.mobile
        if (userData.seized) {
            //console.log("we are in true block")
            const twilioClient = new Twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            const message = await twilioClient.messages.create({
                body: `your subscription has now lapsed. kindly make a payment on the following link to reinstate access to our services. make sure to enter correct email address! - https://legalpapers-payments.onrender.com/view/initiate_payment.html`,
                from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
                to: `+91${mobile}`, // Number of the person you tried to reach
            });
            return res.status(400).send("Your account has undergone a suspension. To reinstate access and restore its functionality, a payment is required. Please proceed with the payment to regain access to your account. payment link has been sent on your registered Mobile!");

        }
        const isPasswordMatch = await bcrypt.compare(password, userData.password);
        if (!isPasswordMatch) {
            return res.status(400).send("Invalid login password");
        }

        //add 3 extra zero for testing in expiresIn time
        const token = jwt.sign(
            { foundUser: userData },
            `${process.env.JWTPRIVATEKEY}`,
            { expiresIn: "14400000000" }  //3 zero extra
        );
        return res.status(200).send({ token, message: "Signin Successful!" });
    }
    catch (err) {
        console.log(`internal server error - ${err.message}`)
        return res.status(500).send(`Internal server error - ${err.message}`);
    }
}
//
//



module.exports = Login;