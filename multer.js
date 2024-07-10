// const multer = require("multer");

// const storage = multer.diskStorage({
//    destination:function(req,file,cb){
//     cb(null,"./uploads/");
//    },
//    filename:function(req,file,cb){
//     cb(null,file.originalname);
//    }
// });

// const fileFilter = (req,file,cb) =>{
//     if(file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg"){
//         cb(null,true);
//     }else{
//         cb(null,false);
//     }
// };

// const upload = multer({
//     storage:storage,
//     fileFilter:fileFilter,
//     limits:{files:4},
// })

// module.exports = upload;

// const multerConfig = () => {
//     const upload = multer({
//         limits:{
//             fileSize:10000000
//         },
//         fileFilter(req, file, cb) {
//             if(!file.originalname.endsWith('.jpg') || !file.originalname.endsWith('.png')) {
                
//             }
//             cb(undefined, true)
//         }
//     })
//     return upload 
// }
// module.exports = multerConfig