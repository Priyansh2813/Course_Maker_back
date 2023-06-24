
import multer from "multer";

const storage=multer.memoryStorage();

//the name "file" is same as used in the code elsewhere anf needs to be exact same.

const singleUpload = multer({storage}).single("file");

export default singleUpload;
