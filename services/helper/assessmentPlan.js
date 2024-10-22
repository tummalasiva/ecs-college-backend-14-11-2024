const assessmentPlanQuery = require("@db/assessmentPlan/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const subjectQuery = require("@db/subject/queries");
const coursePlanQuery = require("@db/coursePlan/queries");
const { default: mongoose } = require("mongoose");

module.exports = class AssessmentPlanHelper {
  static async create(req) {
    try {
      const { exams, subjectId } = req.body;
      const subject = await subjectQuery.findOne({ _id: subjectId });
      if (!subject)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Subject not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(req.body.exams) || !req.body.exams?.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide valid plans array",
          responseCode: "CLIENT_ERROR",
        });

      let data = {
        subject: subject._id,
        createdBy: req.employee,
        plan: exams,
      };

      let assessmentPlanExists = await assessmentPlanQuery.findOne({
        subject: subject._id,
      });
      if (assessmentPlanExists)
        return common.failureResponse({
          message:
            "You have already created an assessment plan for this subject!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newAssessmentPlan = await assessmentPlanQuery.create(data);

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
      const { subjectId } = req.query;

      let filter = {
        subject: subjectId,
      };

      const assessmentPlans = await assessmentPlanQuery.findOne(filter);
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

      if (!Array.isArray(req.body.exams) || !req.body.exams?.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide a valid plans array",
          responseCode: "CLIENT_ERROR",
        });

      const assessmentPlan = await assessmentPlanQuery.findOne({ _id: id });
      if (!assessmentPlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Assessment plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      for (const plan of req.body.exams) {
        const {
          id: planId,
          examTitle,
          maximumMarks,
          weightage,
          count,
          bestOf,
        } = plan;

        // Check if the plan with the specified id exists in the assessment plan's array
        const existingPlanIndex = assessmentPlan.plan.findIndex(
          (p) => p._id.toHexString() === planId
        );

        if (existingPlanIndex !== -1) {
          // Update the specific plan item in the array if it exists
          await assessmentPlanQuery.updateOne(
            { _id: id, "plan._id": mongoose.Types.ObjectId(planId) },
            {
              $set: {
                "plan.$.examTitle": mongoose.Types.ObjectId(examTitle),
                "plan.$.maximumMarks": Number(maximumMarks),
                "plan.$.weightage": Number(weightage),
                "plan.$.count": Number(count),
                "plan.$.bestOf": Number(bestOf),
                updatedBy: mongoose.Types.ObjectId(req.employee),
              },
            }
          );
        } else {
          // If the plan does not exist, add a new one to the array
          await assessmentPlanQuery.updateOne(
            { _id: id },
            {
              $push: {
                plan: {
                  _id: mongoose.Types.ObjectId(planId), // Ensure you pass a valid ObjectId
                  examTitle: mongoose.Types.ObjectId(examTitle),
                  maximumMarks: Number(maximumMarks),
                  weightage: Number(weightage),
                  count: Number(count),
                  bestOf: Number(bestOf),
                  updatedBy: mongoose.Types.ObjectId(req.employee),
                },
              },
            }
          );
        }
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Assessment plan updated successfully!",
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

  static async getExamTitles(req) {
    try {
      const { id } = req.params;

      const coursePlan = await coursePlanQuery.findOne({ _id: id });

      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "coursePlan not found!",
          responseCode: "CLIENT_ERROR",
        });

      const assessmentPlan = await assessmentPlanQuery.findOne({
        subject: coursePlan.subject?._id,
      });
      if (!assessmentPlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Assessment plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      let planTitles = assessmentPlan.plan?.map((a) => ({
        ...a,
        label: `${a.examTitle?.name} - Max. Marks (${a.maximumMarks}) - Weightage (${a.weightage}%)`,
        value: a.examTitle._id,
      }));

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam titles fetched successfully!",
        result: planTitles,
      });
    } catch (error) {
      throw error;
    }
  }
};
