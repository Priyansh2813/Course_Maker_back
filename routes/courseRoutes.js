
import express from "express";
import { getAllCourses ,createCourse, getCourseLectures, addLecture, deleteCourse, deleteLEcture} from "../controllers/courseController.js";
import singleUpload from "../middlewares/multer.js";
import { authorizeSubscribers, authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";


const router = express.Router();


router.route("/courses").get(getAllCourses);

router.route("/createcourse").post(isAuthenticated,authorizedAdmin,singleUpload,createCourse);

router.route("/course/:id").get(isAuthenticated,authorizeSubscribers,getCourseLectures).post(isAuthenticated,singleUpload,addLecture).delete(isAuthenticated,authorizedAdmin,deleteCourse);

router.route("/lecture").delete(isAuthenticated,authorizedAdmin,deleteLEcture);

export default router;
