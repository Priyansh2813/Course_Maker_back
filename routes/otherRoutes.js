import express from "express";
import { contact, courseRequest, getDashboardStats } from "../controllers/otherControllers.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";

const router =express.Router();

//contact form

router.route("/contact").post(contact);

//request
router.route("/courserequest").post(courseRequest);

//get admin dashboard Stats
router.route("/admin/stats").get(isAuthenticated,authorizedAdmin,getDashboardStats);


export default router;

