
import express from "express";
import { getAllCourses ,createCourse, getCourseLectures, addLecture, deleteCourse, deleteLEcture} from "../controllers/courseController.js";
import singleUpload from "../middlewares/multer.js";
import { authorizeSubscribers, authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";


const router = express.Router();
//updated from stackoverflow
router.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
     });
     //end of update
router.route("/courses").get(getAllCourses);

router.route("/createcourse").post(isAuthenticated,authorizedAdmin,singleUpload,createCourse);

router.route("/course/:id").get(isAuthenticated,authorizeSubscribers,getCourseLectures).post(isAuthenticated,singleUpload,addLecture).delete(isAuthenticated,authorizedAdmin,deleteCourse);

router.route("/lecture").delete(isAuthenticated,authorizedAdmin,deleteLEcture);

export default router;
