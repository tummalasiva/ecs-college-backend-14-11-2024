const internalExamQuery = require("@db/internalExam/queries");
const semesterQuery = require("@db/semester/queries");
const employeeSubjectMapping = require("@db/employeeSubjectsMapping/model");
const assessmentPlanQuery = require("@db/assessmentPlan/queries");
const studentQuery = require("@db/assessmentPlan/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class InternalExamService {
  static async create(req) {
    try {
      const {
        subject,
        section,
        examTitle,
        passingMarks,
        questions,
        students,
        duration,
      } = req.body;

      console.log(
        req.body,
        JSON.parse(questions),
        "================================================"
      );

      if (!Array.isArray(JSON.parse(questions)))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Questions should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let assessmentPlanForThisSubject = await assessmentPlanQuery.findOne({
        subject,
        "plan.examTitle": examTitle,
      });
      if (!assessmentPlanForThisSubject)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Assessment Plan not found for this subject!",
          responseCode: "CLIENT_ERROR",
        });

      const currentSemester = await semesterQuery.findOne({ active: true });
      if (!currentSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active semester found!",
          responseCode: "CLIENT_ERROR",
        });

      let employeeSubjectMappingForThisEmployee =
        await employeeSubjectMapping.findOne({
          employee: req.employee,
          semester: currentSemester._id,
          subjects: {
            $elemMatch: {
              subject,
              section,
            },
          },
        });

      if (!employeeSubjectMappingForThisEmployee)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "You are not assigned to this subject in this semester!",
          responseCode: "CLIENT_ERROR",
        });

      const details = assessmentPlanForThisSubject.plan.find(
        (e) => e.examTitle?._id?.toHexString() === examTitle
      );

      if (
        details?.maximumMarks !=
        JSON.parse(questions).reduce(
          (t, c) => t + parseFloat(c.maximumMarks),
          0
        )
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "The total maximum marks should match the sum of all question's maximum marks!",
          responseCode: "CLIENT_ERROR",
        });
      const { count, multipleQuestionsCanBeSet, maximumMarks } = details;

      // if multiple questions can be set then
      if (multipleQuestionsCanBeSet) {
        if (
          !Array.isArray(JSON.parse(students)) ||
          !JSON.parse(students).length
        )
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Students should be an array!",
            responseCode: "CLIENT_ERROR",
          });

        let examWithGivenSetOfStudentsExists = await internalExamQuery.findAll({
          subject,
          semester: currentSemester._id,
          students: { $in: JSON.parse(students) },
          examTitle: examTitle,
          year: parseInt(employeeSubjectMapping.year),
          createdBy: req.employee,
        });

        if (
          examWithGivenSetOfStudentsExists.length &&
          examWithGivenSetOfStudentsExists.length === count
        )
          return common.failureResponse({
            statusCode: httpStatusCode.conflict,
            message:
              "This exam can be created only once in a semester for the given set of students",
            responseCode: "CLIENT_ERROR",
          });
        else if (
          !examWithGivenSetOfStudentsExists.length ||
          (examWithGivenSetOfStudentsExists.length &&
            examWithGivenSetOfStudentsExists.length !== count)
        ) {
          let newExam = await internalExamQuery.create({
            examIndex: examWithGivenSetOfStudentsExists.length + 1,
            subject,
            examTitle,
            passingMarks,
            maximumMarks: JSON.parse(questions).reduce(
              (t, c) => t + parseFloat(c.maximumMarks),
              0
            ),
            semester: currentSemester._id,
            year: employeeSubjectMappingForThisEmployee.year,
            questions: JSON.parse(questions),
            createdBy: req.employee,
            students: JSON.parse(students),
            duration,
          });

          return common.successResponse({
            statusCode: httpStatusCode.created,
            message: "Internal Exam created successfully!",
            responseCode: "SUCCESS",
            result: newExam,
          });
        }
      } else {
        let examWithGivenSetOfStudentsExists = await internalExamQuery.findAll({
          subject,
          semester: currentSemester._id,
          section: section,
          examTitle: examTitle,
          year: parseInt(employeeSubjectMapping.year),
          createdBy: req.empoyee,
        });

        if (
          examWithGivenSetOfStudentsExists.length &&
          examWithGivenSetOfStudentsExists.length === count
        )
          return common.failureResponse({
            statusCode: httpStatusCode.conflict,
            message:
              "This exam can be created only once in a semester for the given set of students",
            responseCode: "CLIENT_ERROR",
          });
        else if (
          !examWithGivenSetOfStudentsExists.length ||
          (examWithGivenSetOfStudentsExists.length &&
            examWithGivenSetOfStudentsExists.length !== count)
        ) {
          let students = await studentQuery.findAll({
            "academicInfo.semester": currentSemester._id,
            "academicInfo.year": employeeSubjectMappingForThisEmployee.year,
            "academicInfo.section": { $in: [section] },
            registeredSubjects: { $in: [subject] },
          });
          let newExam = await internalExamQuery.create({
            examIndex: examWithGivenSetOfStudentsExists.length + 1,
            subject,
            section,
            examTitle,
            passingMarks,
            maximumMarks: JSON.parse(questions).reduce(
              (t, c) => t + parseFloat(c.maximumMarks),
              0
            ),
            semester: currentSemester._id,
            year: employeeSubjectMappingForThisEmployee.year,
            questions: JSON.parse(questions),
            createdBy: req.employee,
            students: students,
            duration,
          });

          return common.successResponse({
            statusCode: httpStatusCode.created,
            message: "Internal Exam created successfully!",
            responseCode: "SUCCESS",
            result: newExam,
          });
        }
      }

      return common.failureResponse({
        statusCode: httpStatusCode.bad_request,
        message: "Invalid request!",
        responseCode: "CLIENT_ERROR",
      });

      // if multiple questions cannot be set then
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const filter = { ...search };
      if (req.employee && !filter.createdBy) {
        filter["createdBy"] = req.employee;
      }
      const exams = await internalExamQuery.findAll(filter);
      return common.successResponse({
        result: exams,
        message: "Exams list fetched successfully!",
        responseCode: "SUCCESS",
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const { id } = req.params;
      await internalExamQuery.delete(id);
      return common.successResponse({
        message: "Exam deleted successfully!",
        responseCode: "SUCCESS",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }
};
