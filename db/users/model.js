/**
 * name : db/users/model
 * author : Aman Karki
 * Date : 07-Oct-2021
 * Description : User schema data
 */

// Dependencies
const mongoose = require('mongoose')
const { aes256cbc } = require('elevate-encryption')
const Schema = mongoose.Schema
// Adding the package
const mongooseLeanGetter = require('mongoose-lean-getters')
const { ObjectId } = require('mongodb')

const userSchema = new Schema(
	{
		mobile: {
			type: String,
			index: {
				unique: true,
			},
			required: true
		},
		email: {
			address: {
				type: String,
				set: aes256cbc.encrypt,
				get: aes256cbc.decrypt,
				index: {
					unique: true,
				},
				required: true,
			},
			verified: {
				type: Boolean,
				default: false,
			},
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		gender: String,
		designation: [{ value: String, label: String }],
		location: [{ value: String, label: String }],
		about: String,
		image: String,
		experience: String,
		lastLoggedInAt: Date,
		deleted: {
			type: Boolean,
			default: false,
			required: true,
		},
		refreshTokens: [{ token: String, exp: Number }],
		otpInfo: {
			otp: Number,
			exp: Number,
		},
		rating: {
			type: Object,
		},
		image: {
			type:String
		}
		
	},
	{
		versionKey: false,
		toObject: { getters: true, setters: true },
		toJSON: { getters: true, setters: true },
		runSettersOnQuery: true,
	}
)
userSchema.plugin(mongooseLeanGetter)
const Users = db.model('users', userSchema)

module.exports = Users
