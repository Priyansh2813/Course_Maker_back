import express from "express";
import { config } from "dotenv";
import course from "./routes/courseRoutes.js";
import ErrorMiddleware from "./middlewares/Error.js";
import user from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";

import other from "./routes/otherRoutes.js";


config({
  path: "./config/config.env",
});

const app = express();


app.use(function (req, res, next) {

  // Website you wish to allow to connect

  const allowedOrigins = ['https://course-maker-frontend.onrender.com', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
 

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});


//using middlewares

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());




//importing and using routes

app.use("/api/v1", course);
app.use("/api/v1", user);

app.use("/api/v1", other);


app.get("/", (req, res) =>
  res.send(
    `<h1>Site is Working. Click <a href=${process.env.FRONTEND_URL}>here</a> to visit frontend.</h1>`
  )
);

app.use(ErrorMiddleware);

export default app;
// this middleware should happen once all other middlewares have be seen / executed.
