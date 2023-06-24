import express from "express";

import { register,login,logout, getMyProfile, changePassword, updateProfile, updateProfilePicture, forgotPassword, resetPassword, removeFromPlaylist, addToPlaylist, getAllUsers, updateUserRole, deleteUser, deleteMyProfile } from "../controllers/userController.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";


const router =express.Router();

router.route("/register").post(singleUpload,register);

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticated,getMyProfile).delete(isAuthenticated,deleteMyProfile);
router.route("/changepassword").put(isAuthenticated,changePassword);
router.route("/updateprofile").put(isAuthenticated,updateProfile);
router.route("/updateprofilepicture").put(isAuthenticated,singleUpload,updateProfilePicture);
router.route("/forgetpassword").post(forgotPassword);
router.route("/resetpassword/:token").put(resetPassword);

router.route("/addtoplaylist").post(isAuthenticated,addToPlaylist);
router.route("/removefromplaylist").delete(isAuthenticated,removeFromPlaylist);
router.route("/admin/users").get(isAuthenticated,authorizedAdmin,getAllUsers);
router.route("/admin/users/:id").put(isAuthenticated,authorizedAdmin,updateUserRole).delete(isAuthenticated,authorizedAdmin,deleteUser);

export default router;