const cieExamQuery = require("@db/cieExam/queries");
const sectionQuery = require("@db/section/queries");
const examTitleQuery = require("@db/examTitle/queries");
const degreeCodeQuery = require("@db/degreeCode/queries");
const subjectQuery = require("@db/subject/queries");
const academicYearQuery = require("@db/academicYear/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { notFoundError } = require("../../helper/helpers");
const ExcelJS = require("exceljs");

const puppeteer = require("puppeteer");
const path = require("path");

//helpers
const {
  compileTemplate,
  uploadFileToS3,
  deleteFile,
} = require("../../helper/helpers");

module.exports = class CieExamService {
  static async create(req) {
    try {
      const { examTitle, degreeCode, semester, subject, questions } = req.body;

      let data = {
        examTitle,
        degreeCode,
        semester,
        subject,
        questions,
        createdBy: req.employee,
      };

      const createdCieExam = await cieExamQuery.create(data);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "CIE exam created successfully!",
        result: createdCieExam,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const cieExams = await cieExamQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: cieExams,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await cieExamQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "CIE exam deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async getMarksUpdateSheet(req) {
    try {
      const { subject, section, degreeCode, academicYear, semester, cieExams } =
        req.query;
      const [
        subjectData,
        sectionData,
        degreeCodeData,
        academicYearData,
        cieExamData,
      ] = await Promise.all([
        subjectQuery.findOne({ _id: subject }),
        sectionQuery.findOne({ _id: section }),
        degreeCodeQuery.findOne({ _id: degreeCode }),
        academicYearQuery.findOne({ _id: academicYear }),
        cieExamQuery.findOne({
          _id: { $in: cieExams },
        }),
      ]);

      if (!subjectData) return notFoundError("Subject not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!degreeCodeData) return notFoundError("Degree Code not found!");
      if (!academicYearData) return notFoundError("Academic Year not found!");
      if (!cieExamData) return notFoundError("CIE Exam not found!");
      // TODO: Implement logic to generate marks update sheet and return it as a downloadable file.

      const workBook = new ExcelJS.Workbook();
      let sheet = workBook.addWorksheet(`Employees-List`);
    } catch (error) {}
  }
};
