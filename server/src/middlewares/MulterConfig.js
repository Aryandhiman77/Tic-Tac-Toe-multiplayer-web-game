const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log(file);
      cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
      console.log(file);
      const encryptedUserId=crypto.createHash("md5").update(req.user.id).digest('hex');
      const filename =encryptedUserId+path.extname(file.originalname);
      cb(null,filename);
    }
  })
  const upload = multer({storage});
  module.exports = upload;