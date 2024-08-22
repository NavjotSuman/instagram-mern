import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import connectMongoDB from "./db/connectMongoDB.js";

const app = express()
configDotenv()


// middlewares
app.use(express.json())
app.use(cookieParser())

// variables
const PORT = process.env.PORT || 4000


// routes
app.get("/",(req,res)=>{
    res.send("you are at root")
})



app.listen(PORT,()=>{
    console.log(`server is running at port ${PORT}`)
    connectMongoDB()
})