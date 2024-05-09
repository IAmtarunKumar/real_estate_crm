const express = require("express")
const MiddleWares = require("./extra.js")
const app = express()
MiddleWares(app)
const dotenv = require("dotenv")
dotenv.config()
const Db = require("./db.js")

// dfsdfsf
const userRouter = require("./routes/userRoute.js")
const leadRouter = require("./routes/leadRoute.js")
const dashboardRouter = require("./routes/dashboardRoute.js")
const Login = require("./Login")

const testRouter = require("./routes/testRoute.js")


app.use(express.json())
const bodyParser = require("body-parser")
const taskRouter = require("./routes/taskRoute.js")

///
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

////
app.get("/", async(req,res)=>{
    try{
    return res.status(200).send(`Real estate crm is working`)
    }catch(error){
        console.log(error.message)
        return res.status(500).send(`Internal server error ${error.message}`)
    }
})
////

//
app.use("/user", userRouter)
app.use("/lead", leadRouter)
app.use("/dashboard", dashboardRouter)
app.use("/task" , taskRouter)
app.use("/test" , testRouter)

//
app.post("/login", async (req, res) => {
  Login(req, res);
});
//


Db()
app.listen(process.env.port, () => {
  console.log(`server is running on port ${process.env.port}`)
})
