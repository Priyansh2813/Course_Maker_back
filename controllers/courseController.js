
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import { Stats } from "../models/Stats.js";
import getDataUri from "../utils/dataURI.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from"cloudinary";



    //We have to use tryCatch so that if async await gives any error we are able to catch it.
    // To do this we will make a different file catchAsyncError (This is a middleware)
export const getAllCourses= catchAsyncError(async (req,res,next)=>{

    const keyword= req.query.keyword || "";
    const category = req.query.category || "";

    const courses = await Course.find({
        title:{
            $regex:keyword,
            $options:"i",
        },
        category:{
            $regex:category,
            $options:"i",

        }
    }).select("-lectures");
    res.status(200).json({
        success:true,
        courses,
    });


});


//to create a new course
export const createCourse= catchAsyncError(async (req,res,next)=>{

    const {title,description,category,createdBy} = req.body;

    if(!title || !description || !category || !createdBy){
    return next(new ErrorHandler("Please add all fields",400));}


    // we will take poster from multer
   // const file=req.file;

   const file = req.file;
const fileURI=getDataUri(file);
const mycloud = await cloudinary.v2.uploader.upload(fileURI.content);


    await Course.create({
        title,
        description,
        category,
        createdBy,
        poster:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url,
        }
    });

    // status--201 means created successfully
    
    res.status(201).json({
        success:true,
        message:"course created successfully.You can add lectures now.",
    });
});



export const getCourseLectures= catchAsyncError(async (req,res,next)=>{


    const course=await Course.findById(req.params.id);

    if(!course) return next(new ErrorHandler("Course not found",404));

    course.views+=1;
    await course.save();

    
    res.status(200).json({
        success:true,
        lectures:course.lectures,
    });
});


//Max video size 100mb
export const addLecture= catchAsyncError(async (req,res,next)=>{

    const {title,description} =req.body;
    const {id}=req.params;
    const course=await Course.findById(id);
    
    if(!course) return next(new ErrorHandler("Course not found",404));

// upload file here
const file = req.file;
const fileURI=getDataUri(file);
const mycloud = await cloudinary.v2.uploader.upload(fileURI.content,{
    resource_type:"video",
}); 
    course.lectures.push(
        {
            title,description,video:{
                public_id:mycloud.public_id,
                url:mycloud.secure_url,
            }
        }
    );

    course.numOfVideos=course.lectures.length;
    await course.save();

    res.status(200).json({
        success:true,
       message:"Lecture added in course",
    });
});


export const deleteCourse= catchAsyncError(async (req,res,next)=>{

    const {id} = req.params;

    const course = await Course.findById(id);
    if(!course) return next(new ErrorHandler("Course not found",404));

    await cloudinary.v2.uploader.destroy(course.poster.public_id);
    for(let i=0;i<course.lectures.length;i++){
        const singleLecture = course.lectures[i];
        await cloudinary.v2.uploader.destroy(singleLecture.video.public_id,{
            resource_type:"video",
        });
    
    }
  await course.deleteOne();


    // we will take poster from multer
   // const file=req.file;

    
    // status--201 means created successfully
    
    res.status(201).json({
        success:true,
        message:"Course Deleted Successfully",
    });
});

export const deleteLEcture= catchAsyncError(async (req,res,next)=>{

    const {courseId,lectureId} = req.query;

    const course = await Course.findById(courseId);
    if(!course) return next(new ErrorHandler("Course not found",404));
    const lecture=course.lectures.find(item=>{
        if(item._id.toString()=== lectureId.toString()) return item;
       });

       await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
        resource_type:"video",});


   
   course.lectures = course.lectures.filter(item=>{
    if(item._id.toString()!== lectureId.toString()) return item;
   })
   course.numOfVideos=course.lectures.length;
   await course.save();

    res.status(201).json({
        success:true,
        message:"Lecture Deleted Successfully",
    });
});

Course.watch().on("change",async ()=>{
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
    const course=await course.find({});
    let totalViews=0;
    for(let i=0;i<course.length;i++){
        totalViews+=course[i].views;
    }
    stats[0].views=totalViews;
    stats.createdAt=new Date(Date.now());
    await stats[0].save();
})





