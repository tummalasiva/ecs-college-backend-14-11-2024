const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mongooseLeanGetter = require('mongoose-lean-getters')


const birthdaySchema = new Schema({
    title:{
        type:String
    },
    image:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'FileUpload',
        required:[true,'Provide image']
    },
})
birthdaySchema.plugin(mongooseLeanGetter)

const Birthday = db.model('Birthday', birthdaySchema)
module.exports = Birthday
