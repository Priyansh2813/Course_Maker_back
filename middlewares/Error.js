const ErrorMiddleware=(err,req,res,next)=>{

    err.statusCode =err.statusCode || 500;  // there will be no message by default hence we create util/errorHandler
    err.message = err.message || "Internal Server Error";

    res.status(err.statusCode).json({
        success:false,
        message:err.message,
    });
}
export default ErrorMiddleware;
