const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");
const examTitleQuery = require("@db/examTitle/queries");
const assessmentPlanQuery = require("@db/assessmentPlan/queries");
const employeeQuery = require("@db/employee/queries");

module.exports = class ExamTitleService {
  static async create(req) {
    try {
      const { name } = req.body;
      const examTitleExist = await examTitleQuery.findOne({
        name: { $regex: new RegExp(`^${name}^`, "i") },
      });
      if (examTitleExist) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
          message: "Exam title already exists!",
        });
      }

      const examTitle = await examTitleQuery.create(req.body);

      return common.successResponse({
        result: examTitle,
        statusCode: httpStatusCode.ok,
        message: "Exam title created successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const examTitles = await examTitleQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam titles fetched successfully!",
        result: examTitles,
      });
    } catch (error) {
      throw error;
    }
  }
  static async update(req) {
    try {
      const id = req.params.id;
      const body = req.body;

      let examTitleWithNameExists = await examTitleQuery.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${body.name}^`, "i") },
      });
      if (examTitleWithNameExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
          message: "Exam title with this name already exists!",
        });

      const examTitleExist = await examTitleQuery.updateOne({ _id: id }, body, {
        new: true,
      });

      if (!examTitleExist) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Exam title not found!",
        });
      }

      return common.successResponse({
        result: examTitleExist,
        statusCode: httpStatusCode.ok,
        message: "Exam title updated successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const id = req.params.id;
      const examTitleExist = await examTitleQuery.delete({ _id: id });

      if (!examTitleExist) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Exam title not found!",
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam title deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async getMyExamTitles(req) {
    try {
      const { subject } = req.query;
      let subjectId = subject.split("-")[0];
      const [assessmentData, employeeData] = await Promise.all([
        assessmentPlanQuery.findOne({ subject: subjectId }),
        employeeQuery.findOne({ _id: req.employee }),
      ]);

      if (!assessmentData)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Assessment plan not found!",
        });

      if (!employeeData)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Employee not found!",
        });

      let examTitles = assessmentData.plan
        .filter((e) => e.conductedBy.includes(employeeData.userType))
        .map((e) => ({
          examTitle: e.examTitle,
          selectStudents: e.multipleQuestionsCanBeSet,
        }));

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "My exam titles fetched successfully!",
        result: examTitles,
      });
    } catch (error) {
      throw error;
    }
  }
};
