const employeeQuery = require("@db/employee/queries");
const assessmentPlanQuery = require("@db/assessmentPlan/queries");
const semesterQuery = require("@db/semester/queries");
const academicYearQuery = require("@db/academicYear/queries");
const employeeSubjectsMapping = require("@db/employeeSubjectsMapping/queries");
const httpStatusCode = require("@generics/http-status");
const coursePlanQuery = require("@db/coursePlan/queries");
const common = require("@constants/common");
const { notFoundError } = require("../../helper/helpers");

module.exports = class AssessmentPlanHelper {
  static async create(req) {
    try {
      const { exams, coursePlanId } = req.body;
      const coursePlan = await coursePlanQuery.findOne({ _id: coursePlanId });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (coursePlan.facultyAssigned?._id?.toHexString() !== req.employee)
        return common.failureResponse({
          message: "You are not assigned to this subject in current semester",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let data = {
        subject: coursePlan.subject?._id,
        section: coursePlan.section?._id,
        semester: coursePlan.semester?._id,
        createdBy: req.employee,
        year: coursePlan.year,
        courseType: coursePlan.courseType,
      };

      let assessmentPlanExists = await assessmentPlanQuery.findOne(data);
      if (assessmentPlanExists)
        return common.failureResponse({
          message:
            "You have already created an assessment plan for this subject in current semester",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newAssessmentPlan = await assessmentPlanQuery.create({
        ...data,
        plan: exams,
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
      const { search = {} } = req.query;

      const assessmentPlans = await assessmentPlanQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Assessment plans fetched successfully!",
        result: assessmentPlans,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(req) {
    try {
      const { coursePlanId } = req.query;
      const coursePlan = await coursePlanQuery.findOne({ _id: coursePlanId });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (coursePlan.facultyAssigned?._id?.toHexString() !== req.employee)
        return common.failureResponse({
          message: "You are not assigned to this subject in current semester",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let filter = {
        semester: coursePlan.semester?._id,
        createdBy: req.employee,
        year: coursePlan.year,
      };

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

  static async update(req) {
    try {
      const { id } = req.params;
      const assessmentPlan = await assessmentPlanQuery.findOne({ _id: id });
      if (!assessmentPlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Assessment plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (assessmentPlan.createdBy?._id?.toHexString() !== req.employee)
        return common.failureResponse({
          message: "You are not authorized to update this assessment plan",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const updatedAssessmentPlan = await assessmentPlanQuery.updateOne(
        { _id: id },
        { $set: req.body }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Assessment plan updated successfully!",
        result: updatedAssessmentPlan,
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
