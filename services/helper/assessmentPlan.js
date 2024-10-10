const employeeQuery = require("@db/employee/queries");
const assessmentPlanQuery = require("@db/assessmentPlan/queries");
const semesterQuery = require("@db/semester/queries");
const academicYearQuery = require("@db/academicYear/queries");
const employeeSubjectMapping = require("@db/employeeSubjectsMapping/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { notFoundError } = require("../../helper/helpers");

module.exports = class AssessmentPlanHelper {
  static async create(req) {
    try {
      const { exams, subject } = req.body;
      let currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Current academic year not found!",
          responseCode: "CLIENT_ERROR",
        });
      let currentSemester = await semesterQuery.findOne({
        active: true,
        academicYear: currentAcademicYear._id,
      });
      if (!currentSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Current semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let employeeSubjectMapping = await employeeSubjectMapping.findOne({
        employee: req.employee,
        semester: currentSemester._id,
        "subjects.subject": subject,
      });

      if (!employeeSubjectMapping)
        return common.failureResponse({
          message: "You are not assigned to this subject in current semester",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let assessmentPlanExists = await assessmentPlanQuery.findOne({
        createdBy: req.employee,
        subject,
        semester: currentSemester._id,
      });
      if (assessmentPlanExists)
        return common.failureResponse({
          message:
            "You have already created an assessment plan for this subject in current semester",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newAssessmentPlan = await assessmentPlanQuery.create({
        exams,
        subject,
        createdBy: req.employee,
        semester: currentSemester._id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Assessment plan created successfully!",
        result: newAssessmentPlan,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search } = req.query;
      const academicYear = await academicYearQuery.findOne({ active: true });
      if (!academicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Academic Year not found!",
          responseCode: "CLIENT_ERROR",
        });
      const semester = await semesterQuery.findOne({
        active: true,
        academicYear: academicYear._id,
      });
      if (!semester) return notFoundError("Semester not found!");
      let filter = { semester, ...search };
      const assessmentPlans = await assessmentPlanQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Assessment plans fetched successfully!",
        result: assessmentPlans,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const { id } = req.params;

      await assessmentPlanQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Assessment plan deleted successfully!",
        result: null,
      });
    } catch (error) {
      throw error;
    }
  }
};
