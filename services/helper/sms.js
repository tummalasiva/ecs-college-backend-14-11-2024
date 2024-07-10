const smsQuery = require('@db/sms/queries');
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const {sendSmsBatch} = require('../../sms-service/smsService');

const puppeteer = require('puppeteer');
const path = require('path')

const {smsService} = require('../../constants/constants');
const { compileTemplate } = require('../../helper/helpers');

module.exports = class SmsService {
	static async create(body) {
		try {

			const sms = await smsQuery.create(body)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: "New sms created successfully",
				result: sms,
			})

		} catch (error) {
			return error
		}
	}

	static async list(params) {
		try {
			let smsList = await smsQuery.listSms(
				params.pageNo,
				params.pageSize,
				params.searchText
			)

			if (smsList[0].data.length < 1) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: "Sms not found",
					result: {
						data: [],
						count: 0,
					},
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: "Sms list fetched successfully",
				result: {
					data: smsList[0].data,
					count: smsList[0].count,
				},
			})

		} catch (error) {
			throw error
		}
	}

	static async update(id, body) {
		try {

			let sms = await smsQuery.findByIdAndUpdateSms({ _id: id }, body,{new:true});
			if (sms) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: "Sms updated successfully",
					result: sms,
				})

			} else {
				return common.failureResponse({
					message: 'Failed to update sms details',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

		} catch (error) {
			throw error
		}
	}

	static async delete(id) {
		try {

			let sms = await smsQuery.findByIdAndDeleteSms({ _id: id });

			if (sms) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: "Sms deleted successfully",
					result: sms
				})

			} else {
				return common.failureResponse({
					message: 'Failed to delete sms details',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

		} catch (error) {
			throw error
		}
	}

	static async details(id) {
		try {
			let sms = await smsQuery.findOne({ _id: id });
			
			if (sms) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: "Sms fetched successfully",
					result: sms,
				})
			} else {
				return common.failureResponse({
					message: 'Failed to find the sms details',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

		} catch (error) {
			throw error
		}
	}

    static async smsReport(id) {
        const sms = await smsQuery.findOne({
            _id:id
        })
        if(!sms) throw new Error('No sms data found');
        const data = {
            sms
        }
         console.log(data,"data")
        const browser = await puppeteer.launch({
            headless:true,
            ignoreDefaultArgs: ['--disable-extensions'],
            args:[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--hide-scrollbars',
                '--disable-gpu',
                '--mute-audio',
            ]
        })
        const page = await browser.newPage();

        const content = await compileTemplate("sms-status",data);
        console.log(content,"content")

        await page.setContent(content);

        const xlsxPath = path.join('./static','xlsx.full.min.js');

        await page.addScriptTag({ path: xlsxPath });

        const xlsxFile = await page.evaluate(() => {
            var table = document.body.getElementsByTagName('table')[0];
            var wb = XLSX.utils.table_to_book(table);
            return XLSX.write(wb, {type: "binary", bookType: "xlsx"});
        })
        browser.close();
        const bufferXlsx = new Buffer.from(xlsxFile,'binary')
        
        return {
            statusCode:200,
            message:"Sms report",
            bufferXlsx
          }
    }
}
