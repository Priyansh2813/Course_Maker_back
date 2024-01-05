import express from "express";
import {
  contact,
  courseRequest,
  getDashboardStats,
} from "../controllers/otherControllers.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
//updated from stackoverflow
router.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, DELETE, PATCH, OPTIONS"
  );
});
//end of update
//contact form

router.route("/contact").post(contact);

//request
router.route("/courserequest").post(courseRequest);

//get admin dashboard Stats
router
  .route("/admin/stats")
  .get(isAuthenticated, authorizedAdmin, getDashboardStats);

export default router;
