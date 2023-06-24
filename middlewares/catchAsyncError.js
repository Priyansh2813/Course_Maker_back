//This is going to be a function which will be returning a function and there can be different syntax to write it.

//the input here is also a function

export const catchAsyncError=(passedFunction)=>(req,res,next)=>{
    Promise.resolve(passedFunction(req,res,next)).catch(next);

}