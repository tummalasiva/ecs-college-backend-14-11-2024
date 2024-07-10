const examTermQuery = require("@db/examTerm/queries");
const academicTermQuery = require("@db/academicYear/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class ExamTermService {
  static async create(bodyData) {
    try {
      const activeAcademicYear = await academicTermQuery.findOne({
        active: true,
      });
      if (!activeAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      const examTermWithThisTitleAndSchool = await examTermQuery.findOne({
        title: { $regex: new RegExp(`^${bodyData.title}$`, "i") },
        school: bodyData.school,
      });
      if (examTermWithThisTitleAndSchool) {
        return common.failureResponse({
          message: "Exam with the given title already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      bodyData.academicYear = activeAcademicYear._id;
      const newExamTitle = await examTermQuery.create(bodyData);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam added successfully!",
        result: newExamTitle,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      let examTerms = await examTermQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: examTerms,
      });
    } catch (error) {
      throw error;
    }
  }

  static async listPublic(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      filter["isPublic"] = true;

      let examTerms = await examTermQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: examTerms,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body) {
    try {
      const { title } = body;
      delete body.academicYear;

      let examTitleWithGivenId = await examTermQuery.findOne({
        _id: id,
      });

      if (!examTitleWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Exam not found!",
          statusCode: "CLIENT_ERROR",
        });

      const examTermWithThisTitleAndSchool = await examTermQuery.findOne({
        title: { $regex: new RegExp(`^${body.title}$`, "i") },
        school: examTitleWithGivenId.school,
        _id: { $ne: id },
      });
      if (examTermWithThisTitleAndSchool) {
        return common.failureResponse({
          message: "Exam with the given title already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      const updatedExamTitle = await examTermQuery.updateOne(
        { _id: id },
        body,
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam updated successfully!",
        result: updatedExamTitle,
      });
    } catch (error) {
      return error;
    }
  }

  static async delete(id, userId) {
    try {
      let examTerm = await examTermQuery.delete({ _id: id });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam deleted successfully!",
        result: examTerm,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let examTerm = await examTermQuery.findOne({ _id: id });

      if (examTerm) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          result: examTerm,
        });
      } else {
        return common.failureResponse({
          message: "Exam not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
