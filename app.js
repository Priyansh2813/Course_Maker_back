import express from "express";
import { config } from "dotenv";
import course from "./routes/courseRoutes.js";
import ErrorMiddleware from "./middlewares/Error.js";
import user from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";

import other from "./routes/otherRoutes.js";
import cors from "cors";

config({
  path: "./config/config.env",
});

const app = express();


app.use(cors({
  origin: process.env.ORIGIN,
  methods: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  allowedHeaders: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  credentials: true
}));


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
