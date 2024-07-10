/**
 * name : email-notifications
 * author : Rakesh Kumar
 * Date : 03-Nov-2021
 * Description : Contains email notifications related data
 */

//Dependencies
// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const nodemailer = require('nodemailer');

const axios = require('axios');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    // port: 587,
    auth: {
        user: 'rakesh.doddmane@gmail.com',
        pass: 'asdasdasd'
    }
});

// send email



/**
 * Send Email
 * @method
 * @name sendEmail
 * @param  {Object} params - contains email information for sending email
 * @param  {String} params.from - email id of the sender
 * @param  {String} params.to - email id of the receiver
 * @param  {String} params.subject - subject of the email
 * @param  {String} params.body - contains email content
 * @param  {String} params.cc - contains the cc of the email
 * @returns {JSON} Returns response of the email sending information
 */
async function sendEmail(params) {
	try {

		console.log("------------------------------");
		let fromMail = process.env.SENDGRID_FROM_MAIL
		if (params.from) {
			fromMail = params.from
		}
		const to = params.to.split(',')

		let message = {
			from: fromMail, // sender address
			to: to, // list of receivers
			subject: params.subject, // Subject line
			html: params.body,
		}
		if (params.cc) {
			message['cc'] = params.cc.split(',')
		}
		if (params.replyTo) {
			message['replyTo'] = params.replyTo
		}
		try {
			console.log("------------------------------");
			let response = await transporter.sendMail({
				from: 'rakesh.doddmane@gmail.com',
				to: 'rakesh.k@pacewisdom.com',
				subject: 'Test Email Subject',
				text: 'Example Plain Text Message Body'
			});

			console.log("------------------------------",response);
			// await sgMail.send(message)
		} catch (error) {
			console.log("==================",error);
			if (error.response) {
				return error
			}
		}
		return {
			status: 'success',
			message: 'successfully mail sent',
		}
	} catch (error) {
		return {
			status: 'failed',
			message: 'Mail server is down, please try after some time',
			errorObject: error,
		}
	}
}


async function sendSms(params) {
	try {

		params['sender'] = process.env.SMS_SENDER_ID;
		params['service'] = "T";

		let data = await axios({
			method: 'post',
			headers: {'Authorization': "Bearer "+process.env.SMS_ACCESS_KEY, 'Content-Type':'application/json' },
			url: process.env.SMS_ENDPOINT,
			data: params
		  });

	

		return {
			status: 'success',
			message: data,
		}

	} catch (error) {
		return {
			status: 'failed',
			message: 'Mail server is down, please try after some time',
			errorObject: error,
		}
	}
}



module.exports = {
	sendEmail: sendEmail,
	sendSms: sendSms
}
