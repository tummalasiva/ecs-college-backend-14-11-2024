const classQuery = require("@db/class/queries");
const examScheduleQuery = require("@db/examSchedule/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const academicYearQuery = require("@db/academicYear/queries");
const examTermQuery = require("@db/examTerm/queries");
const subjectQuery = require("@db/subject/queries");
const studentQuery = require("@db/student/queries");
const schoolQuery = require("@db/school/queries");

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const { compileTemplate } = require("../../helper/helpers");

module.exports = class ExamScheduleService {
  static async create(req) {
    const body = req.body;
    console.log(body, "body");
    const school = req.schoolId;
    try {
      const academicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!academicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      const classExists = await classQuery.findOne({
        _id: body.class,
        school: school,
      });
      if (!classExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Selected class not found!",
          responseCode: "CLIENT_ERROR",
        });

      const examTermExists = await examTermQuery.findOne({
        _id: body.examTerm,
        academicYear: academicYear._id,
      });

      if (!examTermExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Selected exam term not found!",
          responseCode: "CLIENT_ERROR",
        });
      const subjectExsits = await subjectQuery.findOne({
        _id: body.subject,
        class: classExists._id,
      });

      if (!subjectExsits)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Selected subject not found!",
          responseCode: "CLIENT_ERROR",
        });

      const examScheduleExists = await examScheduleQuery.findOne({
        class: body.class,
        examTerm: body.examTerm,
        subject: body.subject,
      });
      if (examScheduleExists)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Exam schedule for this subject, exam and class already exists!",
          responseCode: "CLIENT_ERROR",
        });

      const examSchedule = await examScheduleQuery.create({
        ...body,
        school,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam schedule created successfully!",
        result: examSchedule,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }

      let scheduleList = await examScheduleQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: scheduleList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      const { orderSequence } = body;

      console.log(body, "body");

      let examScheduleWithId = await examScheduleQuery.findOne({ _id: id });
      if (!examScheduleWithId) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Exam schedule not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (examScheduleWithId.orderSequence !== orderSequence) {
        let examScheduleWithProvidedOrderSequence =
          await examScheduleQuery.findOne({
            orderSequence,
            school: examScheduleWithId.school._id,
          });
        if (!examScheduleWithProvidedOrderSequence) {
          let updatedExamSchedule = await examScheduleQuery.updateOne(
            { _id: id },
            {
              $set: {
                ...body,
                practicalMarks:
                  body.practical === "active" ? body.practicalMarks : 0,
              },
            },
            { new: true, runValidators: true }
          );
          return common.successResponse({
            result: updatedExamSchedule,
            message: `Exam Schedule updated successfully!`,
            statusCode: httpStatusCode.ok,
          });
        } else {
          let orderSequenceForSecondExamSchedule =
            examScheduleWithId.orderSequence;

          let updatedExamSchedule = await examScheduleQuery.updateOne(
            { _id: id },
            { $set: { ...body } },
            { new: true }
          );
          let secondExamSchedule = await examScheduleQuery.updateOne(
            { _id: examScheduleWithProvidedOrderSequence._id },
            { $set: { orderSequence: orderSequenceForSecondExamSchedule } }
          );

          return common.successResponse({
            result: updatedExamSchedule,
            message: `Exam Schedule updated successfully!`,
            statusCode: httpStatusCode.ok,
          });
        }
      } else {
        let updatedExamSchedule = await examScheduleQuery.updateOne(
          { _id: id },
          { $set: { ...body } },
          { new: true, runValidator: true }
        );
        return common.successResponse({
          result: updatedExamSchedule,
          message: `Exam Schedule updated successfully!`,
          statusCode: httpStatusCode.ok,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let examSchedule = await examScheduleQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Exam schedule deleted successfully!",
        result: examSchedule,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let examSchedule = await examScheduleQuery.findOne({ _id: id });

      if (examSchedule) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          result: examSchedule,
        });
      } else {
        return common.failureResponse({
          message: "Exam Schedule not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async generateHallTicket(req) {
    try {
      const { classId, examId, sectionId } = req.query;

      const academicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!academicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      const schoolClass = await classQuery.findOne({
        _id: classId,
      });
      if (!schoolClass)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Selected class not found!",
          responseCode: "CLIENT_ERROR",
        });

      const schoolInfo = await schoolQuery.findOne({ _id: req.schoolId });

      const examTerm = await examTermQuery.findOne({
        _id: examId,
      });
      if (!examTerm)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Selected exam term not found!",
          responseCode: "CLIENT_ERROR",
        });

      const examSchedules = await examScheduleQuery.findAll({
        examTerm: examId,
        class: schoolClass._id,
        school: req.schoolId,
      });

      const students = await studentQuery.findAll({
        school: req.schoolId,
        "academicInfo.class": classId,
        "academicInfo.section": sectionId,
        academicYear: academicYear._id,
        active: true,
      });

      // let signBuffer;
      // if (
      //   schoolClass.className.includes("6") ||
      //   schoolClass.className.includes("7") ||
      //   schoolClass.className.includes("8")
      // ) {
      //   const signPath = path.join("./static", "primary head master sign.png");
      //   const signFile = fs.readFileSync(signPath);
      //   signBuffer = signFile.toString("base64");
      // } else {
      //   const signPath = path.join(
      //     "./static",
      //     "High school Head Master sign.png"
      //   );
      //   const signFile = fs.readFileSync(signPath);
      //   signBuffer = signFile.toString("base64");
      // }

      const data = {
        examSchedules,
        students,
        schoolInfo: schoolInfo,
        exam: examTerm,
        // signImg: `data:image/*;base64,${signBuffer}`,
      };

      const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ["--disable-extensions"],
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--hide-scrollbars",
          "--disable-gpu",
          "--mute-audio",
        ],
      });
      const page = await browser.newPage();
      const content = await compileTemplate("hallTicket", data);

      if (!content) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Failed to generate HTML content",
          responseCode: "SERVER_ERROR",
        });
      }

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
        margin: {
          top: 20,
          left: 5,
          right: 5,
        },
      });

      browser.close();

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: pdf,
        meta: {
          "Content-Type": "application/pdf",
          "Content-Length": pdf.length,
        },
      });
    } catch (error) {
      throw error;
    }
  }
};
