const { ObjectID } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongooseLeanGetter = require("mongoose-lean-getters");

const fileuploadSchema = new Schema({
  data: {
    type: Buffer,
  },
  contentType: {
    type: String,
  },
  link: {
    type: String,
  },
});
fileuploadSchema.plugin(mongooseLeanGetter);

const FileUpload = db.model("FileUpload", fileuploadSchema);
module.exports = FileUpload;
