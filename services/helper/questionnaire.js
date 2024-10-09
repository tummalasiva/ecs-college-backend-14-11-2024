const questionnaireQuery = require("@db/questionnaire/queries");
const academicYearQuery = require("@db/academicYear/queries");
const semesterQuery = require("@db/semester/queries");
const studentQuery = require("@db/student/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class QuestionnaireHelper {
  static async create(req) {
    try {
      const { year, subject, section, questions } = req.body;
      const employee = req.employee;
      if (!Array.isArray(questions))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Questions should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let academicYear = await academicYearQuery.findOne({ active: true });
      if (!academicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found!",
          responseCode: "CLIENT_ERROR",
        });

      let activeSemester = await semesterQuery.findOne({
        active: true,
        academicYear: academicYear._id,
      });
      if (!activeSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active semester found!",
          responseCode: "CLIENT_ERROR",
        });

      let students = await studentQuery.findAll({
        "academicInfo.semester": activeSemester._id,
        "academicInfo.section": { $in: [section] },
        "academicInfo.year": year,
        registeredSubjects: { $in: [subject] },
        active: true,
      });

      let bodyData = {
        subject,
        section,
        totalSubmissionNeeded: students.length,
        academicYear: academicYear._id,
        semester: activeSemester._id,
        degreeCode: students[0]?.academicInfo?.degreeCode?._id,
        questions,
        createdBy: employee,
        active: false,
        year,
      };

      let questionnaireExists = await questionnaireQuery.findOne({
        section,
        subject,
        semester: activeSemester._id,
        createdBy: employee,
      });

      if (questionnaireExists)
        return common.failureResponse({
          statusCode: httpStatusCode.conflict,
          message:
            "Questionnaire for the given subject, section, and semester already exists!",
          responseCode: "CLIENT_ERROR",
        });

      let newQuestionnaire = await questionnaireQuery.create(bodyData);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Questionnaire created successfully!",
        result: newQuestionnaire,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;

      const questionnaires = await questionnaireQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: questionnaires,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const questionnaire = await questionnaireQuery.findOne({
        _id: req.params.id,
      });
      if (!questionnaire)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Questionnaire not found!",
          responseCode: "CLIENT_ERROR",
        });

      await questionnaireQuery.delete({ _id: req.params.id });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Questionnaire deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleActiveStatus(req) {
    try {
      let questionnaire = await questionnaireQuery.findOne({
        _id: req.params.id,
      });
      if (!questionnaire) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Questionnaire not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      let updatedQuestionnaire = await questionnaire.updateOne(
        { _id: req.params.id },
        { $set: { active: !questionnaire.active } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Questionnaire status updated successfully!",
        result: updatedQuestionnaire,
      });
    } catch (error) {
      throw error;
    }
  }
};
