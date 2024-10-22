const questionnaireQuery = require("@db/questionnaire/queries");
const Questionnaire = require("@db/questionnaire/model");
const coursePlanQuery = require("@db/coursePlan/queries");
const Feedback = require("@db/feedback/model");
const studentQuery = require("@db/student/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { request } = require("express");
const { default: mongoose } = require("mongoose");

module.exports = class QuestionnaireHelper {
  static async create(req) {
    try {
      const { questions, coursePlanId } = req.body;
      const employee = req.employee;
      if (!Array.isArray(questions))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Questions should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      const coursePlan = await coursePlanQuery.findOne({ _id: coursePlanId });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Course Plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      const { section, subject, year, semester } = coursePlan;

      let students = await studentQuery.findAll({
        "academicInfo.semester": semester?._id,
        "academicInfo.section": { $in: [section?._id] },
        "academicInfo.year": year,
        registeredSubjects: { $in: [subject?._id] },
        active: true,
      });

      let bodyData = {
        subject: subject?._id,
        section: section?._id,
        totalSubmissionNeeded: students.length,
        semester: semester?._id,
        questions,
        createdBy: employee,
        active: false,
        year,
      };

      let questionnaireExists = await questionnaireQuery.findAll({
        section,
        subject,
        semester: semester._id,
        createdBy: employee,
      });

      bodyData["questionnaireIndex"] = questionnaireExists.length + 1;

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

  static async update(req) {
    try {
      const { questions, coursePlanId } = req.body;
      const employee = req.employee;
      if (!Array.isArray(questions))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Questions should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      const coursePlan = await coursePlanQuery.findOne({ _id: coursePlanId });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Course Plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      const questionnaire = await questionnaireQuery.findOne({
        _id: req.params.id,
      });
      if (!questionnaire)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Questionnaire not found!",
          responseCode: "CLIENT_ERROR",
        });

      for (const question of questions) {
        const { id: questionId, text, co, coAttainmentThreshold } = question;

        // Check if the question with the specified id exists in the questionnare question's array
        const existingQuestionIndex = questionnaire.questions.findIndex(
          (p) => p._id.toHexString() === questionId
        );

        if (existingQuestionIndex !== -1) {
          // Update the specific plan item in the array if it exists
          await questionnaireQuery.updateOne(
            {
              _id: req.params.id,
              "questions._id": mongoose.Types.ObjectId(questionId),
            },
            {
              $set: {
                "questions.$.text": text,
                "questions.$.co": co,
                "questions.$.coAttainmentThreshold": coAttainmentThreshold,
              },
            }
          );
        } else {
          // If the plan does not exist, add a new one to the array
          await questionnaireQuery.updateOne(
            { _id: req.params.id },
            {
              $push: {
                questions: {
                  text,
                  co,
                  coAttainmentThreshold,
                },
              },
            }
          );
        }
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Questionnaire updated successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;

      let filter = { ...search };

      if (search.coursePlanId) {
        let coursePlan = await coursePlanQuery.findOne({
          _id: filter.coursePlanId,
        });
        if (!coursePlan)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Course Plan not found!",
            responseCode: "CLIENT_ERROR",
          });

        filter["section"] = coursePlan.section?._id;
        filter["subject"] = coursePlan.subject?._id;
        filter["createdBy"] = req.employee;
        filter["semester"] = coursePlan.semester?._id;
        filter["year"] = coursePlan.year;

        delete filter.coursePlanId;
      }

      const questionnaires = await questionnaireQuery.findAll(filter);

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
      await Feedback.deleteMany({ questionnaire: req.param.id });
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
      let updatedQuestionnaire = await questionnaireQuery.updateOne(
        { _id: req.params.id },
        [{ $set: { active: { $eq: ["$active", false] } } }]
      );

      if (!updatedQuestionnaire) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Questionnaire not found!",
          responseCode: "CLIENT_ERROR",
        });
      }
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Questionnaire status updated successfully!",
        result: updatedQuestionnaire,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getCoAttainment(req) {
    try {
      // Step 1: Get all questionnaires for the specified semester
      const { coursePlanId } = req.query;

      let coursePlan = await coursePlanQuery.findOne({ _id: coursePlanId });

      const questionnaires = await Questionnaire.aggregate([
        {
          $match: {
            semester: coursePlan.semester?._id,
            subject: coursePlan.subject?._id,
            section: coursePlan.section?._id,
            year: coursePlan.year,
            createdBy: mongoose.Types.ObjectId(req.employee),
          },
        },
        {
          $lookup: {
            from: "feedbacks", // The name of the Feedback collection in the database
            localField: "_id",
            foreignField: "questionnaire",
            as: "feedbacks",
          },
        },
        {
          $unwind: "$feedbacks",
        },
        {
          $unwind: "$questions",
        },
        {
          $unwind: "$feedbacks.submittedResponse",
        },
        {
          $match: {
            // Ensure that we match the question text with the feedback submission text
            $expr: {
              $eq: ["$questions.text", "$feedbacks.submittedResponse.text"],
            },
          },
        },
        {
          $group: {
            _id: "$questions.co",
            totalResponses: { $sum: 1 },
            attainedResponses: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      "$feedbacks.submittedResponse.score",
                      "$questions.coAttainmentThreshold",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $addFields: {
            attainmentPercentage: {
              $multiply: [
                { $divide: ["$attainedResponses", "$totalResponses"] },
                100,
              ],
            },
          },
        },
      ]);

      // Step 2: Calculate the overall attainment percentage
      const overallAttainment = await Questionnaire.aggregate([
        {
          $match: {
            semester: coursePlan.semester?._id,
            subject: coursePlan.subject?._id,
            section: coursePlan.section?._id,
            year: coursePlan.year,
            createdBy: mongoose.Types.ObjectId(req.employee),
          },
        },
        {
          $lookup: {
            from: "feedbacks",
            localField: "_id",
            foreignField: "questionnaire",
            as: "feedbacks",
          },
        },
        {
          $unwind: "$feedbacks",
        },
        {
          $unwind: "$feedbacks.submittedResponse",
        },
        {
          $group: {
            _id: null,
            totalResponses: { $sum: 1 },
            attainedResponses: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      "$feedbacks.submittedResponse.score",
                      "$questions.coAttainmentThreshold",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            overallAttainmentPercentage: {
              $multiply: [
                { $divide: ["$attainedResponses", "$totalResponses"] },
                100,
              ],
            },
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: {
          individualCoAttainment: questionnaires,
          overallCoAttainment:
            overallAttainment[0]?.overallAttainmentPercentage || 0,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getMyQuestionnaires(req) {
    try {
      const student = req.student;
      const filter = {
        subject: { $in: student.registeredSubjects.map((s) => s._id) },
        section: { $in: student.academicInfo.section.map((s) => s._id) },
        semester: student.academicInfo.semester?._id,
        year: student.academicInfo.year,
        active: true,
      };

      let list = await questionnaireQuery.findAll(filter);
      list = list.map((l) => ({
        questions: l.questions,
        createdAt: l.createdAt,
        subject: l.subject,
        semester: l.semester,
        year: l.year,
        _id: l._id,
      }));

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: list,
      });
    } catch (error) {
      throw error;
    }
  }
};
