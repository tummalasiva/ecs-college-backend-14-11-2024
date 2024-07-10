
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mongooseLeanGetter = require('mongoose-lean-getters')

const smsSchema = new Schema({
    smsType:{
        type:String,
        required:[true,'provide smsType']
    },
    smsSubject:{
        type:String,
    },
    smsTemplateId:{
        type:String
    },
    message:{
        type:String,
        required:[true,'provide message']
    },
    messageDetails:{
        type:Array,
    },
    sentTime:{
        type:Date,
        default:Date.now()
    },
    isNotification:{
        type:Boolean,
    },
    messageStatus:[{
        type:Object
    }],
    total:{
        type:Number,
        default:0
    },
    failed:{
        type:Number,
        default:0
    },
    delivered:{
        type:Number,
        default:0
    }

})
smsSchema.plugin(mongooseLeanGetter)

const Sms = db.model('Sms', smsSchema)
module.exports = Sms