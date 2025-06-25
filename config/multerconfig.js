import crypto from "crypto";
import path from "path";
import multer from "multer";


// disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(15 , (err,bytes)=>{
            const fn = bytes.toString("hex") + path.extname(file.originalname)
            cb(null, fn) 
          })
    }
  })
  
//   export upload variable
const upload = multer({ storage: storage })

export default upload;
