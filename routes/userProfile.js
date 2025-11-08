const cloudinary = require("./cloudinary");
const multer = require("multer");
const storage = multer.diskStorage({});
const upload = multer({ storage });


app