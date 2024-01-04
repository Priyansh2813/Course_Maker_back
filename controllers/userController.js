import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import getDataUri from "../utils/dataURI.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
import { Stats } from "../models/Stats.js";




export const register =catchAsyncError(async(req,res,next)=>{

    const {name,email,password}=req.body;
    const file=req.file;
   

    if(!name || !email || !password || !file) return next(new ErrorHandler("Please enter all fields",400));
    let user = await User.findOne({email});
    if(user) return next(new ErrorHandler("user already  exits",409)); //409 means conflict in request

    const fileURI=getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileURI.content); 
    user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url,
        }
    });
    sendToken(res,user,"Registered Successfully",201);

});

export const login =catchAsyncError(async(req,res,next)=>{

    const {email,password}=req.body;
  
    if(!email || !password) return next(new ErrorHandler("Please enter all fields",400));
    const user = await User.findOne({email}).select("+password"); // we need to select password explicitly

    if(!user) return next(new ErrorHandler("ncorrect Email or Password",409)); //409 means conflict in request

    //upload file on couldnary
   const isMatch= await user.comparePassword(password);

   if(!isMatch) return next(new ErrorHandler("Incorrect Email or Password"),401);

    sendToken(res,user,`Welcome back, ${user.name}`,200);

});

export const logout = catchAsyncError(async (req,res,next)=>{
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
        secure:true,
        sameSite:"none",
    }).json({
        success:true,
        message:"Logged out successfully",
    })
});

export const getMyProfile = catchAsyncError(async (req,res,next)=>{
//we need a middleware which can automatically get the id of logged in user and also unknown person cannot access this.
//hence we are making a middleware of isAuthenticated
    const user=await User.findById(req.user._id);

    res.status(200).json({
        success:true,
        user,
    })
});

export const changePassword = catchAsyncError(async (req,res,next)=>{


        const {oldPassword,newPassword} =req.body;

        if(!oldPassword || !newPassword) return next(new ErrorHandler("Please enter all details",400));

        const user=await User.findById(req.user._id).select("+password");
        const isMatch = await user.comparePassword(oldPassword);

        if(!isMatch) return next(new ErrorHandler("Incorrect Old password",400));
        user.password=newPassword;
        await user.save();

    
        res.status(200).json({
            success:true,
            message:"password changed successfully",
        })
    });


    export const updateProfile = catchAsyncError(async (req,res,next)=>{

    

        const {name,email} =req.body;
        const user = await User.findById(req.user._id);
        if(name)  user.name=name;
        if(email) user.email=email;
        await user.save();

    
        res.status(200).json({
            success:true,
            message:"Profile Updates Successfully",
        })
    });

    export const updateProfilePicture = catchAsyncError(async (req,res,next)=>{
           
        const file=req.file;
        const fileURI=getDataUri(file);
        const user = await User.findById(req.user._id);
        const mycloud = await cloudinary.v2.uploader.upload(fileURI.content); 

        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        user.avatar={
            public_id:mycloud.public_id,
            url:mycloud.secure_url,
        };
       await user.save();
    
        res.status(200).json({
            success:true,
            message:"ProfilePicture Updated Successfully",
        })
    });

    export const forgotPassword = catchAsyncError(async (req,res,next)=>{
       const {email} = req.body;
       const user= await User.findOne({email});

       if(!user) return next(new ErrorHandler("User not found",400));

       const resetToken= await user.getResetToken();

       await user.save();
        //http://localhost:3000/resetpassword/as;nadohaiopnsfdopi
    const url=`${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
       const message = `Click on the link to reset your password. ${url}. If you have not requested then please ignore.`
        //send token by email create a sendEmail in utils
       await sendEmail(user.email,"CourseMaker Reset Password",message);




    res.status(200).json({
        success:true,
        message:`Reset token has been sent to ${user.email}`,
    })
});



export const resetPassword = catchAsyncError(async (req,res,next)=>{
    const {token}=req.params;
    const resetPasswordToken=crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt:Date.now(),
        }
    });
    if(!user) return next(new ErrorHandler("Token is invalid or expired.",401));

    user.password=req.body.password;
    user.resetPasswordExpire=undefined;
    user.resetPasswordToken=undefined;
    await user.save();


res.status(200).json({
    success:true,
    message:"Password changed succesfully",
})
});


export const addToPlaylist = catchAsyncError(async (req,res,next)=>{
   
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.body.id);


    if(!course) return next(new ErrorHandler("Invalid Course Id",404));

    const itemExist=user.playlist.find((item)=>{
        if(item.course.toString()==course._id.toString()) return true;
    })

    if(itemExist) return next(new ErrorHandler("Item Already exists",409));


    //add to the playlist array of the course model
    user.playlist.push({
        course:course._id,
        poster:course.poster.url,
    });

    await user.save();



    res.status(200).json({
        success:true,
        message:"Added to Playlist",
    })
    });


export const removeFromPlaylist = catchAsyncError(async (req,res,next)=>{
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.query.id);


    if(!course) return next(new ErrorHandler("Invalid Course Id",404));

    //gives all the items which doesnt match the id 
    //i.e a new playlist with no element as requested by the user
   const newPlaylist =user.playlist.filter(item=>{
    if(item.course.toString()!==course._id.toString()) return item;
   });
   
     user.playlist=newPlaylist;
   

    await user.save();
    res.status(200).json({
        success:true,
        message:"Removed From Playlist",
    })
});



//admin control routes


export const getAllUsers = catchAsyncError(async (req,res,next)=>{
   
    const users = await User.find();


  
    res.status(200).json({
        success:true,
        users,
    })
});


export const updateUserRole = catchAsyncError(async (req,res,next)=>{
   

    const user = await User.findById(req.params.id);

    if(!user) return next(new ErrorHandler("User Not Found",401));
    if(user.role === "user") user.role = "admin";
    else user.role="user";
  await user.save();
    res.status(200).json({
        success:true,
        message:"Role Updated",
    })
});
export const deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
  
    if (!user) return next(new ErrorHandler("User not found", 404));
  
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  
    // Cancel Subscription of the user
  
    await user.deleteOne();
  
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  });

  export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
  
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  
    // Cancel Subscription
  
    await user.deleteOne();
  
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({
        success: true,
        message: "User Deleted Successfully",
      });
  });
  
  User.watch().on("change",async ()=>{
    const stats= await Stats.find({}).sort({
        createdAt:"desc"
    }).limit(12);
    const subscription= await User.find({"subscription.status":"active"}).limit(1);
    stats[0].users= await User.countDocuments();
    stats[0].subscription= subscription.length;
    stats[0].createdAt=new Date(Date.now());
    await stats[0].save();

  })