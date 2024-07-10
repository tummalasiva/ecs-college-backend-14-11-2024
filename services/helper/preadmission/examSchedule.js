const examScheduleQuery = require("@db/preadmission/examSchedule/queries");
const ExamSchedule = require("@db/preadmission/examSchedule/model");
const examQuery = require("@db/preadmission/exam/queries");
const enquiryQuery = require("@db/preadmission/enquiry/queries");

const classQuery = require("@db/class/queries");
const academicYearQuery = require("@db/academicYear/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { notFoundError } = require("../../../helper/helpers");
const { default: mongoose } = require("mongoose");

module.exports = class ExamScheduleService {
  static async create(body) {
    try {
      const {
        classId,
        examId,
        academicYearId,
        address,
        roomNumber,
        dateOfExam,
        startTime,
        endTime,
      } = body;

      console.log(body, "body data");

      const [classData, examData, academicYearData] = await Promise.all([
        classQuery.findOne({
          _id: classId,
        }),
        examQuery.findOne({
          _id: examId,
        }),
        academicYearQuery.findOne({
          _id: academicYearId,
        }),
      ]);

      if (!classData)
        return notFoundError("No class with the given id was found!");

      if (!examData) return notFoundError("No exam with given id was found!");

      if (!academicYearData)
        return notFoundError("No exam with given id was found!");

      let examScheduleId = new mongoose.Types.ObjectId();

      let CLIENT_URL =
        process.env.NODE_ENV === "production"
          ? process.env.LIVE_CLIENT_URL
          : process.env.TEST_CLIENT_URL;

      let examLink = `${CLIENT_URL}/pre-admission/exam-conduct/${examScheduleId}`;
      let venueLink = `${CLIENT_URL}/details/pre-admission/${examScheduleId}`;

      let newExamSchedule = await examScheduleQuery.create({
        _id: examScheduleId,
        examLink: examLink,
        venueLink,
        school: req.schoolId,
        academicYear: academicYearId,
        class: classId,
        exam: examId,
        venue: { address, roomNumber },
        startTime,
        endTime,
        dateOfExam,
      });

      newExamSchedule = await examScheduleQuery.findOne({
        _id: newExamSchedule._id,
      });

      await enquiryQuery.updateMany(
        {
          "studentDetails.academicInfo.class": classId,
          "studentDetails.academicInfo.academicYear": academicYearId,
        },
        { $set: { examScheduled: true, examSchedule: newExamSchedule._id } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Pre-Addmission exam schedule created successfully!",
        result: newExamSchedule,
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
      let allExamSchedules = await examScheduleQuery.findAll(filter);

      return common.successResponse({
        result: allExamSchedules,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const scheduleId = id;

      await Promise.all([
        examScheduleQuery.delete({ _id: scheduleId }),

        examQuery.updateMany(
          { examSchedule: scheduleId },
          { $set: { examScheduled: false } }
        ),
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam schedule deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, bodyData) {
    try {
      const scheduleId = id;
      const {
        classId,
        examId,
        academicYearId,
        address,
        roomNumber,
        dateOfExam,
        startTime,
        endTime,
      } = bodyData;

      const [classData, examData, academicYearData] = await Promise.all([
        classQuery.findOne({
          _id: classId,
        }),

        examQuery.findOne({
          _id: examId,
        }),
        academicYearQuery.findOne({
          _id: academicYearId,
        }),
      ]);

      if (!classData) return notFoundError("Class with given id was not found");

      if (!examData) return notFoundError("Class with given id was not found");

      if (!academicYearData)
        return notFoundError("Academic year with the given id was not found!");

      const response = await examScheduleQuery.updateOne(
        { _id: scheduleId },
        {
          academicYear: academicYearId,
          class: classId,
          exam: examId,
          venue: { address, roomNumber },
          startTime,
          endTime,
          dateOfExam,
        },
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam schedule updated successfully!",
        result: response,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getVenueDetails(req) {
    try {
      const scheduleId = req.params.id;

      const examSchedule = await examScheduleQuery.findOne({
        _id: scheduleId,
      });

      return common.successResponse({
        result: examSchedule,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  // todo
  static async sendVenueDetailsToStudents(req) {}

  static async enableExamLink(req) {
    try {
      const examScheduleId = req.params.id;
      let examScheduleWithGivenId = await examScheduleQuery.updateOne(
        { _id: examScheduleId },
        [{ $set: { examLinkEnabled: { $eq: [false, "$examLinkEnabled"] } } }],
        { new: true }
      );

      if (!examScheduleWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.notFound,
          message: "Exam Schedule to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: examScheduleWithGivenId,
        message: "Link updated successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async getExamDetails(req) {
    try {
      let examSchedule = await examScheduleQuery.findOne({
        _id: req.params.id,
        examLinkEnabled: true,
      });

      if (!examSchedule)
        return common.failureResponse({
          statusCode: httpStatusCode.notFound,
          message: "Exam details not found!",
          responseCode: "CLIENT_ERROR",
        });
      return common.successResponse({
        result: examSchedule,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async submitResult(req) {
    try {
      let examScheduleId = req.params.id;
      const { submission, enquiryId } = req.body;
      let examScheduleWithTheGivenId = await examScheduleQuery.findOne({
        _id: examScheduleId,
        examLinkEnabled: true,
      });

      if (!examScheduleWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.notFound,
          message: "Exam submission link disabled!",
          responseCode: "CLIENT_ERROR",
        });

      let examQuestions = examScheduleWithTheGivenId.exam.quiz;

      let correctQuestionsDone = [];
      let incorrectQuestionsDone = [];

      let studentQuizDetails = [];

      for (let sub of submission) {
        let answerSubmitted = sub.selectedAnswer;
        let originalQuizData = examQuestions.filter(
          (q) => q._id.toHexString() == sub._id
        )[0];
        let correctAnswer = originalQuizData?.correctOption;

        let newItem = {
          question: originalQuizData.question,
          options: originalQuizData.options,
          correctOption: originalQuizData.correctOption,
          selectedOption: answerSubmitted,
        };
        if (
          correctAnswer &&
          originalQuizData.options.filter(
            (o) => o._id.toHexString() == answerSubmitted
          )[0].value === correctAnswer
        ) {
          correctQuestionsDone.push(sub);
          (newItem.attempted = true),
            (newItem.marksAwarded =
              examScheduleWithTheGivenId.exam.marksPerQuestion);
        } else if (
          correctAnswer &&
          originalQuizData.options.filter(
            (o) => o._id.toHexString() == answerSubmitted
          )[0].value !== correctAnswer
        ) {
          incorrectQuestionsDone.push(sub);
          newItem.attempted = true;
          newItem.marksAwarded = examScheduleWithTheGivenId.exam.negativeMarking
            ? examScheduleWithTheGivenId.exam.negativeMarkingPerQuestion
            : examScheduleWithTheGivenId.exam.marksPerQuestion;
        } else {
          newItem.attempted = false;
          newItem.marksAwarded = 0;
        }

        studentQuizDetails.push(newItem);
      }

      let marksObtained =
        examScheduleWithTheGivenId.exam.marksPerQuestion *
        correctQuestionsDone.length;
      if (examScheduleWithTheGivenId.exam.negativeMarking) {
        marksObtained =
          marksObtained -
          examScheduleWithTheGivenId.exam.negativeMarkingPerQuestion *
            incorrectQuestionsDone.length;
      }

      let examTakenDetails = {
        ...examScheduleWithTheGivenId.exam,
        quiz: studentQuizDetails,
        obtainedMarks: marksObtained,
      };

      await enquiryQuery.updateOne(
        { enquiryId },
        { $set: { examTakenDetails, examConducted: true } }
      );

      return common.successResponse({
        message: "Exam completed successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }
};
