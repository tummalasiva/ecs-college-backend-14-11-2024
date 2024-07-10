/**
 * name : utils.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : Utils helper function.
 */

const bcryptJs = require('bcryptjs')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const path = require('path')
const { AwsFileHelper, GcpFileHelper, AzureFileHelper, OciFileHelper } = require('elevate-cloud-storage')
const { RedisCache, InternalCache } = require('elevate-node-cache')
const md5 = require('md5')
const crypto = require('crypto')

const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

const algorithm = 'aes-256-cbc'

const aws = require('aws-sdk');

const generateToken = (tokenData, secretKey, expiresIn) => {
	return jwt.sign(tokenData, secretKey, { expiresIn })
}

const hashPassword = (password) => {
	const salt = bcryptJs.genSaltSync(10)
	let hashPassword = bcryptJs.hashSync(password, salt)
	return hashPassword
}

const comparePassword = (password1, password2) => {
	return bcryptJs.compareSync(password1, password2)
}

const clearFile = (filePath) => {
	fs.unlink(filePath, (err) => {
		if (err) logger.error(err)
	})
}

const composeEmailBody = (body, params) => {
	return body.replace(/{([^{}]*)}/g, (a, b) => {
		var r = params[b]
		return typeof r === 'string' || typeof r === 'number' ? r : a
	})
}

const getDownloadableUrl = async (imgPath) => {
	if (process.env.CLOUD_STORAGE === 'GCP') {
		const options = {
			destFilePath: imgPath,
			bucketName: process.env.DEFAULT_GCP_BUCKET_NAME,
			gcpProjectId: process.env.GCP_PROJECT_ID,
			gcpJsonFilePath: path.join(__dirname, '../', process.env.GCP_PATH),
		}
		imgPath = await GcpFileHelper.getDownloadableUrl(options)
	} else if (process.env.CLOUD_STORAGE === 'AWS') {

		aws.config.update({
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			// signatureVersion: config.signature_version,
			region: process.env.AWS_BUCKET_REGION
		  })
		
		  const s3 = new aws.S3({ });

		const options = {
			Key: imgPath,
			Bucket: process.env.DEFAULT_AWS_BUCKET_NAME,
			Expires: 60 * 60 * 24 * 7
			// bucketRegion: process.env.AWS_BUCKET_REGION,
		}
		// const options = {
		// 	destFilePath: imgPath,
		// 	bucketName: process.env.DEFAULT_AWS_BUCKET_NAME,
		// 	 bucketRegion: process.env.AWS_BUCKET_REGION,
		// }

		try {
			imgPath = await new Promise((resolve, reject) => {
			  s3.getSignedUrl('getObject', options, (err, url) => {
				err ? reject(err) : resolve(url);
			  });
			});
			console.log(imgPath)
		  } catch (err) {
			if (err) {
			  console.log(err)
			}
		  }

		// s3.getObject('getObject',options, function (err, data) {
		// 	if (err) {
		// 	//   res.status(200);
		// 	//   res.end('Error Fetching File');
		// 	console.log("err     --------------",err);
		// 	}
		// 	else {
				
		// 		console.log("response     --------------",data.Body);

			
				
		// 	//   res.attachment(params.Key); // Set Filename
		// 	//   res.type(data.ContentType); // Set FileType
		// 	//   res.send(data.Body);        // Send File Buffer
		// 	}
		//   });

		// imgPath = await AwsFileHelper.getDownloadableUrl(options.destFilePath, options.bucketName, options.bucketRegion)
	} else if (process.env.CLOUD_STORAGE === 'AZURE') {
		const options = {
			destFilePath: imgPath,
			containerName: process.env.DEFAULT_AZURE_CONTAINER_NAME,
			expiry: 30,
			actionType: 'rw',
			accountName: process.env.AZURE_ACCOUNT_NAME,
			accountKey: process.env.AZURE_ACCOUNT_KEY,
		}
		imgPath = await AzureFileHelper.getDownloadableUrl(options)
	} else if (process.env.CLOUD_STORAGE === 'OCI') {
		const options = {
			destFilePath: imgPath,
			bucketName: process.env.DEFAULT_OCI_BUCKET_NAME,
			endpoint: process.env.OCI_BUCKET_ENDPOINT,
		}
		imgPath = await OciFileHelper.getDownloadableUrl(options)
	}
	return imgPath
}

/**
 * md5 hash
 * @function
 * @name md5Hash
 * @returns {String} returns uuid.
 */

function md5Hash(value) {
	return md5(value)
}

function internalSet(key, value) {
	return InternalCache.setKey(key, value)
}
function internalGet(key) {
	return InternalCache.getKey(key)
}
function internalDel(key) {
	return InternalCache.delKey(key)
}

function redisSet(key, value, exp) {
	return RedisCache.setKey(key, value, exp)
}
function redisGet(key) {
	return RedisCache.getKey(key)
}
function redisDel(key) {
	return RedisCache.deleteKey(key)
}

module.exports = {
	generateToken,
	hashPassword,
	comparePassword,
	clearFile,
	composeEmailBody,
	getDownloadableUrl,
	md5Hash,

	internalSet: internalSet,
	internalDel: internalDel,
	internalGet: internalGet,
	redisSet: redisSet,
	redisGet: redisGet,
	redisDel: redisDel,
}
