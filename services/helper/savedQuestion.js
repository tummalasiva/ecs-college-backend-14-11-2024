const savedQuestionQuery = require("@db/savedQuestion/queries");
const httpStatusCode = require("@generics/http-status");
const employeeQuery = require("@db/employee/queries");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class SavedQuestionHelper {
  // static async create(req) {
  //   try {
  //     let file = "";
  //     if (req.files && req.files.image) {
  //       file = await uploadFileToS3(req.files.image);
  //     }

  //     req.body.coId = req.body.coId?.split(",");

  //     if (!Array.isArray(req.body.coId))
  //       return common.failureResponse({
  //         statusCode: httpStatusCode.bad_request,
  //         message: "Course Outcome ID should be an array",
  //       });

  //     let currentEmployee = await employeeQuery.findOne({ _id: req.employee });

  //     let savedQuestion = await savedQuestionQuery.create({
  //       ...req.body,
  //       createdBy: req.employee,
  //       image: file,
  //       approved: currentEmployee?.userType === "hod" ? true : false,
  //     });
  //     return common.successResponse({
  //       statusCode: httpStatusCode.ok,
  //       message: "Saved Question created successfully",
  //       result: savedQuestion,
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  static async create(req) {
    try {
      const {
        subject,
        question,
        isMcq,
        options,
        answer,
        maximumMarks,
        minimumMarksForCoAttainment,
        cos,
        bl,
      } = req.body;

      if (isMcq && !Array.isArray(options.split(",")))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Options should be an array if isMcq is true!",
          responseCode: "CLIENT_ERROR",
        });

      if (isMcq && !options.split(",").length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Options should not be empty if isMcq is true!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(cos.split(",")))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Cos should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let currentEmployee = await employeeQuery.findOne({ _id: req.employee });

      let data = {
        subject,
        question,
        isMcq,
        options: isMcq ? options.split(",") : [],
        cos: cos.split(","),
        answer,
        maximumMarks,
        minimumMarksForCoAttainment,
        createdBy: req.employee,
        images: [],
        bl,
        approved: currentEmployee?.userType === "hod" ? true : false,
      };

      if (req.files && req.files.images) {
        if (Array.isArray(req.files.images)) {
          for (let image of req.files.images) {
            let link = await uploadFileToS3(image);
            if (link) data.images.push(link);
          }
        } else {
          let link = await uploadFileToS3(req.files.images);
          if (link) data.images.push(link);
        }
      }

      let newQuestion = await savedQuestionQuery.create(data);
      return common.successResponse({
        result: newQuestion,
        statusCode: httpStatusCode.ok,
        message: "Question created successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const list = await savedQuestionQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Saved Question fetched successfully",
        result: list,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      let savedQuestion = await savedQuestionQuery.findOne({
        _id: req.params.id,
      });
      if (!savedQuestion)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Saved Question not found",
          responseCode: "CLIENT_ERROR",
        });

      let file = savedQuestion.image;

      req.body.coId = req.body.coId?.split(",");

      if (!Array.isArray(req.body.coId))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Course Outcome ID should be an array",
        });

      if (req.files && req.files.image) {
        if (file) await deleteFile(file);
        file = await uploadFileToS3(req.files.image);
      }
      const updatedSavedQuestion = await savedQuestionQuery.updateOne(
        { _id: req.params.id },
        {
          $set: {
            ...req.body,
            image: file,
            approved:
              savedQuestion.createdBy?.userType === "hod" ? true : false,
          },
        },
        { new: true }
      );
      if (!updatedSavedQuestion)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Saved Question not found",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Saved Question updated successfully",
        result: updatedSavedQuestion,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await savedQuestionQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Saved Question deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
