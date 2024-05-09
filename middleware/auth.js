const jwt = require("jsonwebtoken");
const dotenv = require("dotenv")
dotenv.config()

const verifyToken = (req, res, next) => {
    // const token = req.headers.authorization;
    const token = req.headers.authorization;
    if (!token) return res.status(400).send("No token provided.");
    // console.log("token", token)
    const tokenWithoutBearer = token.split(" ")[1]; // Get token without 'Bearer '



    jwt.verify(tokenWithoutBearer, process.env.JWTPRIVATEKEY, (err, decoded) => {
        if (err) {
            // console.log("error", err.message)
            return res.status(403).send("Token is expired!");
        }
        // console.log("decoded", decoded.foundUser)
        req.foundUser = decoded.foundUser; // Assuming you have an 'id' field in your token
        next();
    });
};

module.exports = verifyToken;
