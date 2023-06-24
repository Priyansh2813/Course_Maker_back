import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { buySubscription, cancelSubscription, getRazorPayKey, paymentVerification } from "../controllers/paymentController.js";

const router =express.Router();



//subcription
router.route("/subscribe").get(isAuthenticated,buySubscription);
//verification payment and storing the referennce in the database
router.route("/paymentverification").post(isAuthenticated,paymentVerification);

//get razorpay key
router.route("/razorpaykey").get(getRazorPayKey);


//cancel subscription
router.route("/subscribe/cancel").delete(isAuthenticated,cancelSubscription)


export default router;

