const birthdayImageQuery = require('@db/birthdayImage/queries');
const fileUploadModel = require('@db/fileUpload/model');

const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')

module.exports = class BirthdayImageService {
	static async create(body) {
		try {

			const birthdayImage = await birthdayImageQuery.create(body)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: "BIRTHDAYIMAGE_UPLOADED_SUCCESSFULLY",
				result: birthdayImage,
			})

		} catch (error) {
			return error
		}
	}

	static async list(params) {
		try {
			let birthdayImageList = await birthdayImageQuery.listBirthdayImage(
				params.pageNo,
				params.pageSize,
				params.searchText
			)

			if (birthdayImageList[0].data.length < 1) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: "BIRTHDAYIMAGES_NOT_FOUND",
					result: {
						data: [],
						count: 0,
					},
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: "BIRTHDAYIMAGES_FETCHED_SUCCESSFULLY",
				result: {
					data: birthdayImageList[0].data,
					count: birthdayImageList[0].count,
				},
			})

		} catch (error) {
			throw error
		}
	}

	static async delete(id, userId) {
		try {

			let birthdayImage = await birthdayImageQuery.findByIdAndDeleteBirthdayImage({ _id: id });
            await fileUploadModel.findByIdAndDelete(birthdayImage.image);
           
			if (birthdayImage) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: "BIRTHDAYIMAGE_DELETED_SUCCESSFULLY",
					result: birthdayImage,
				})

			} else {
				return common.failureResponse({
					message: 'Failed to delete birthdayImage details',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

		} catch (error) {
			throw error
		}
	}

}
