const examQuery = require("@db/preadmission/exam/queries");
const classQuery = require("@db/class/queries");
const academicYearQuery = require("@db/academicYear/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { notFoundError } = require("../../../helper/helpers");

module.exports = class ExamService {
  static async create(req, body) {
    try {
      const {
        examName,
        classId,
        academicYear,
        negativeMarking,
        negativeMarkingPerQuestion,
        marksPerQuestion,
        additionalInstructions,
        passingPercentage,
        quiz,
      } = body;

      console.log(body, "================================================");

      const [existingData, classData, academicYearData] = await Promise.all([
        await examQuery.findOne({
          name: examName.trim(),
          class: classId,
          academicYear: academicYear,
        }),
        await classQuery.findOne({
          _id: classId,
        }),
        await academicYearQuery.findOne({
          _id: academicYear,
        }),
      ]);

      if (existingData)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Exam name already exists for this class and academic year!",
          responseCode: "CLIENT_ERROR",
        });

      if (!classData)
        return notFoundError("Class with the given id was not found!");

      if (!academicYearData)
        return notFoundError("Academic year with the given id was not found!");

      if (!Array.isArray(quiz))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide a valid quiz data!",
          responseCode: "CLIENT_ERROR",
        });
      if (!Array.isArray(additionalInstructions))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide a valid additional instructions!",
          responseCode: "CLIENT_ERROR",
        });

      let totalMarks = quiz.length * marksPerQuestion;
      let passingMarks = totalMarks * (passingPercentage / 100);

      let newExam = await examQuery.create({
        class: classId,
        academicYear: academicYear,
        passingMarks,
        totalMarks,
        quiz,
        examName,
        marksPerQuestion,
        negativeMarking,
        negativeMarkingPerQuestion: negativeMarkingPerQuestion,
        additionalInstructions,
        school: req.schoolId,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam created successfully!",
        result: newExam,
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
      const allExams = await examQuery.findAll(filter);

      return common.successResponse({
        result: allExams,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const examId = id;
      await examQuery.delete({ _id: examId });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, bodyData) {
    try {
      const examId = id;
      const {
        classId,
        academicYear,
        examName,
        negativeMarking,
        negativeMarkingPerQuestion,
        marksPerQuestion,
        additionalInstructions,
        passingPercentage,
        quiz,
      } = bodyData;

      const [examExistsData, classData, academicYearData] = await Promise.all([
        examQuery.findOne({
          _id: { $nin: [examId] },
          name: examName,
          class: classId,
          academicYear: academicYear,
        }),
        classQuery.findOne({
          _id: classId,
        }),
        academicYearQuery.findOne({
          _id: academicYear,
        }),
      ]);

      if (examExistsData)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Exam name already exists for this class and academic year!",
          responseCode: "CLIENT_ERROR",
        });

      if (!classData)
        return notFoundError("Class with the given id was not found!");

      if (!academicYearData)
        return notFoundError("Academic year with the given id was not found!");

      if (!Array.isArray(quiz))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide a valid quiz data!",
          responseCode: "CLIENT_ERROR",
        });
      if (!Array.isArray(additionalInstructions))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide a valid additional instructions!",
          responseCode: "CLIENT_ERROR",
        });

      let totalMarks = quiz.length * marksPerQuestion;
      let passingMarks = totalMarks * (passingPercentage / 100);

      const updatedExam = await examQuery.updateOne(
        { _id: examId },
        {
          class: classId,
          academicYear: academicYear,
          passingMarks,
          examName,
          totalMarks,
          quiz,
          marksPerQuestion,
          negativeMarking,
          negativeMarkingPerQuestion: negativeMarkingPerQuestion,
          additionalInstructions,
        },
        { new: true }
      );
      if (!updatedExam)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Exam not updated!",
          responseCode: "CLIENT_ERROR",
        });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam updated successfully!",
        result: updatedExam,
      });
    } catch (error) {
      throw error;
    }
  }
};
