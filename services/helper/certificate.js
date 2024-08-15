const httpStatusCode = require("@generics/http-status");
const academicYearQuery = require("@db/academicYear/queries");
const common = require("@constants/common");
const moment = require("moment");
const mongoose = require("mongoose");
const schoolQuery = require("@db/school/queries");
const studentQuery = require("@db/student/queries");
const { notFoundError, compileTemplate } = require("../../helper/helpers");
const puppeteer = require("puppeteer");

module.exports = class CertificateService {
  static async getStudyCertificate(req) {
    try {
      const { studentId, academicYearId } = req.query;
      const school = req.schoolId;

      console.log(req.query, "query");

      // if (!moment(req.params.startYear, "YYYY", true).isValid())
      //   return common.failureResponse({
      //     message: "Provide valid start year",
      //     statusCode: httpStatusCode.bad_request,
      //     responseCode: "CLIENT_ERROR",
      //   });
      // if (!moment(req.params.endYear, "YYYY", true).isValid())
      //   return common.failureResponse({
      //     message: "Provide valid end year",
      //     statusCode: httpStatusCode.bad_request,
      //     responseCode: "CLIENT_ERROR",
      //   });

      const [schoolData, studentData, academicYearData] = await Promise.all([
        schoolQuery.findOne({ _id: school }),
        studentQuery.findOne({ _id: studentId }),
        academicYearQuery.findOne({ _id: academicYearId }),
      ]);

      if (!schoolData) return notFoundError("School not found");
      if (!studentData) return notFoundError("Student not found");
      if (!academicYearData) return notFoundError("Academic year not found");

      const data = {
        settings: schoolData,
        studentData,
        dob: moment(studentData.basicInfo.dob).format("DD-MM-YYYY"),
        dateNow: moment(Date.now()).format("DD-MM-YYYY"),
        startYear: academicYearData.from,
        endYear: academicYearData.to,
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

      const content = await compileTemplate("study-certificate", data);

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
        margin: {
          top: 15,
          left: 15,
          right: 15,
          bottom: 30,
        },
      });
      await browser.close();

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

  static async getBulkStudyCertificate(req) {
    try {
      const { startYear, endYear, studentId, classId, sectionId } = req.query;
      const school = req.schoolId;
      if (!moment(startYear, "YYYY", true).isValid())
        return common.failureResponse({
          message: "Provide valid start year",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      if (!moment(endYear, "YYYY", true).isValid())
        return common.failureResponse({
          message: "Provide valid end year",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      const studentIds = studentId.map((id) => mongoose.Types.ObjectId(id));

      const settings = await schoolQuery.findOne({ _id: school });

      if (!settings)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "School not found!",
          responseCode: "CLIENT_ERROR",
        });

      const student = await studentQuery.findAll({
        school,
        "academicInfo.class": classId,
        "academicInfo.section": sectionId,
        _id: { $in: studentIds },
      });

      if (!student)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Students not found!",
          responseCode: "CLIENT_ERROR",
        });

      const data = {
        settings: settings,
        student,
        dateNow: moment(Date.now()).format("DD-MM-YYYY"),
        startYear: req.params.startYear,
        endYear: req.params.endYear,
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

      const content = await compileTemplate("bulk-certificate", data);

      await page.setContent(content);
      const pdf = await page.pdf({
        format: "A4",
        margin: {
          top: 15,
          left: 15,
          right: 15,
          bottom: 15,
        },
      });
      await browser.close();

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

  static async getTransferCertificate(req) {
    try {
      const settings = await schoolQuery.findOne({
        _id: req.schoolId,
      });

      if (!settings)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "School not found!",
          responseCode: "CLIENT_ERROR",
        });
      data = {
        settings: settings,
        ...req.body.data,
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

      const content = await compileTemplate("transfer-certificate", data);

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
        margin: {
          top: 5,
          left: 15,
          right: 15,
        },
      });
      await browser.close();

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        meta: {
          "Content-Type": "application/pdf",
          "Content-Length": pdf.length,
        },
        result: pdf,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getBulkTransferCertificate(req) {
    try {
      const settings = await schoolQuery.findOne({
        _id: req.schoolId,
      });

      if (!settings) return notFoundError("School not found!");
      const data = {
        settings: settings,
        ...req.body.data,
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

      const content = await compileTemplate("bulktransfer-certificate", data);
      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
        margin: {
          top: 5,
          left: 15,
          right: 15,
        },
      });
      await browser.close();

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
