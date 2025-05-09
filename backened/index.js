const express = require("express")
const cors = require("cors")
const dbConnect= require("./DataBase/db.js")
const bodyParser = require('body-parser')
const authRoutes = require("./routes/authRoute.js")
const pollRoutes=require("./routes/pollRoute.js")

const path = require('path')
require("dotenv").config()


const PORT = process.env.PORT || 5000;

const app = express()

app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(
    cors({
        origin:process.env.CLIENT_URL || "*",
        methods:["GET", "POST","PUT","DELETE"],
        allowedHeaders:["Content-Type","Authorization"],
    })
);

app.get("/",(req,res)=>{
    res.send("welcome to the project")
    
})  

app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/poll",pollRoutes)

app.listen(PORT,()=>{
    console.log(`Server is listing at ${PORT}`);
    dbConnect()
    
})