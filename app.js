import express from "express";
import {config} from "dotenv";
import course from "./routes/courseRoutes.js"
import ErrorMiddleware from "./middlewares/Error.js";
import  user from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import payment from "./routes/paymentroutes.js";
import other from "./routes/otherRoutes.js";
config({
    path:"./config/config.env"
})
const app=express();

//using middlewares 
app.use(express.json());
app.use(
    express.urlencoded({
        extended:true,
    })
);
app.use(cookieParser());



//importing and using routes

app.use("/api/v1",course);
app.use("/api/v1",user);
app.use("/api/v1",payment);
app.use("/api/v1",other);
export default app;

app.use(ErrorMiddleware); // this middleware should happen once all other middlewares have be seen / executed.
