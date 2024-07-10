const periodicalQuery = require("@db/library/periodical/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../../helper/helpers");

module.exports = class PeriodicalService {
  static async create(bodyData, files) {
    try {
      let bookCover = "";
      let periodicalTitleExists = await periodicalQuery.findOne({
        title: { $regex: new RegExp(`^${bodyData.title}`, "i") },
      });
      if (periodicalTitleExists)
        return common.failureResponse({
          message: "Periodical with the given title already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      if (files && files.bookCover) {
        bookCover = await uploadFileToS3(files.bookCover);
      }

      bodyData.bookCover = bookCover;
      let newPeriodical = await periodicalQuery.create(bodyData);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Periodical added successfully!",
        result: newPeriodical,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const filter = { ...search };

      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      let periodicals = await periodicalQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: periodicals,
        message: "Periodicals fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, files) {
    try {
      let periodicalExistsWithTitle = await periodicalQuery.findOne({
        _id: { $ne: id },
        title: { $regex: new RegExp(`^${body.title}`, "i") },
      });
      if (periodicalExistsWithTitle)
        return common.failureResponse({
          message: "Periodical with the given title already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let periodicalExists = await periodicalQuery.findOne({ _id: id });
      if (!periodicalExists)
        return common.failureResponse({
          message: "Periodical not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      let bookCover = periodicalExists.bookCover;

      if (files && files.bookCover) {
        if (bookCover) {
          await deleteFile(bookCover);
        }

        bookCover = await uploadFileToS3(files.bookCover);
      }

      body.bookCover = bookCover;

      let updatedPeriodical = await periodicalQuery.updateOne(
        { _id: id },
        body,
        {
          new: true,
        }
      );
      if (updatedPeriodical) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Periodical updated successfully!",
          result: updatedPeriodical,
        });
      } else {
        return common.failureResponse({
          message: "Periodical not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      let periodicalWithGivenId = await periodicalQuery.findOne({ _id: id });
      if (!periodicalWithGivenId)
        return common.failureResponse({
          message: "Periodical not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      if (periodicalWithGivenId.bookCover) {
        await deleteFile(periodicalWithGivenId.bookCover);
      }

      await periodicalQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Periodical deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
