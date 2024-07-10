const fileUploadModel = require("@db/fileUpload/model");
const fileUploadQuery = require("@db/fileUpload/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class ClassService {
  static async create(req) {
    try {
      var resData = [];
      if (req.files.length === 0) throw new Error("No files found");

      if (Object.keys(req.files.files).length > 4) {
        let fileUpload = new fileUploadModel();

        fileUpload.data = req.files.files.data;
        fileUpload.contentType = req.files.files.mimetype;
        fileUpload.link =
          `${req.protocol}://${req.headers.host}/ecamps/v1/fileUpload/showDocuments/` +
          fileUpload._id;
        const newFileUpload = await fileUploadQuery.create(fileUpload);
        resData.push({
          _id: newFileUpload._id,
          contentType: newFileUpload.contentType,
          link: newFileUpload.link,
        });
      } else {
        for (let file of req.files.files) {
          const fileUploads = new fileUploadModel();
          fileUploads.data = file.data;
          fileUploads.contentType = file.mimetype;
          fileUploads.link =
            `${req.protocol}://${req.headers.host}/ecamps/v1/fileUpload/showDocuments/` +
            fileUploads._id;
          const newFileUploads = await fileUploadQuery.create(fileUploads);
          resData.push({
            _id: newFileUploads._id,
            contentType: newFileUploads.contentType,
            link: newFileUploads.link,
          });
        }
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "File is uploaded successfully",
        result: resData,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(params) {
    try {
      let fileList = await fileUploadQuery.listFile(
        params.pageNo,
        params.pageSize,
        params.searchText
      );

      if (fileList[0].data.length < 1) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "No files found",
          result: {
            data: [],
            count: 0,
          },
        });
      }
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Files fetched  successfully",
        result: {
          data: fileList[0].data,
          count: fileList[0].count,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async showDocuments(id) {
    try {
      let showDocuments = await fileUploadQuery.findByIdFile({ _id: id });
      if (!showDocuments) throw new Error("No file found");
      return {
        hasFile: true,
        statusCode: 200,
        message: "File fetched successfully",
        showDocuments,
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(id,req, body) {
		try {
      // console.log(req.files,"req.file")
      if (!req.files) {
        return common.failureResponse({
					message: 'No file found',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
      }
        const data = {
          data: req.files.buffer,
          contentType: req.files.mimetype,
        };
			let fileUploades = await fileUploadQuery.findByIdAndUpdateFile(id,data,{new:true});
      console.log(fileUploades,"fileUploades")
			if (fileUploades) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: "File updated successfully",
					result: {
            data: {
              _id: fileUploades._id,
              link: fileUploades.link,
            },
          },
				})

			} else {
				return common.failureResponse({
					message: 'Failed to update file details',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

		} catch (error) {
			throw error
		}
	}

	static async delete(id, userId) {
		try {

			let fileUpload = await fileUploadQuery.findByIdAndDeleteFile({ _id: id });

			if (fileUpload) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: "File deleted successfully",
					result: {
            data: {
              _id: fileUpload._id,
              contentType: fileUpload.contentType,
              link: fileUpload.link,
            },
          },
				})

			} else {
				return common.failureResponse({
					message: 'Failed to delete file details',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

		} catch (error) {
			throw error
		}
	}


};
