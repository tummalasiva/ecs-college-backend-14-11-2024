const studentCheckoutQuery = require("@db/studentCheckout/queries");
const studentQuery = require("@db/student/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");
const moment = require("moment");
const puppeteer = require("puppeteer");
const path = require("path");

const ExcelJS = require("exceljs");

const { compileTemplate } = require("../../helper/helpers");

module.exports = class VisitorInfoService {
  static async list(req) {
    const { search = {} } = req.query;
    if (req.schoolId) {
      search["school"] = req.schoolId;
    }
    try {
      let studentCheckoutList = await studentCheckoutQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: studentCheckoutList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const {
        student,
        reason,
        relationship,
        visitorName,
        receiveOtp,
        visitorContactNumber,
        schoolId,
      } = req.body;

      let studentWithTheGivenId = await studentQuery.findOne({ _id: student });
      if (!studentWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student not found!",
          responseCode: "CLIENT_ERROR",
        });

      let verificationOtp = studentWithTheGivenId.verificationOtp;
      let otpExpiry = studentWithTheGivenId.otpExpiry;

      if (!verificationOtp || !otpExpiry)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid request!",
          responseCode: "CLIENT_ERROR",
        });

      let currentDate = new Date();
      if (moment(currentDate).diff(otpExpiry, "seconds") > 0)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Otp expired!",
          responseCode: "CLIENT_ERROR",
        });

      if (verificationOtp != receiveOtp)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid Otp!",
          responseCode: "CLIENT_ERROR",
        });

      const updatedStudentVisitor = await studentCheckoutQuery.updateOne(
        { student: student },
        {
          student,
          visitorContactNumber,
          relationship,
          visitorName,
          school: schoolId,
          reason,
        },
        { new: true, upsert: true }
      );

      await studentQuery.updateOne(
        { _id: student },
        { $set: { otpExpiry: null, verificationOtp: null } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student checked out successfully!",
        result: updatedStudentVisitor,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      await studentCheckoutQuery.delete({
        _id: id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student checkout entry deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadPdf(req) {
    try {
      let filter = {};
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }

      const visitorInfo = await studentCheckoutQuery.findAll(filter);

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

      const content = await compileTemplate("studentCheckout", {
        data: visitorInfo,
        school: visitorInfo[0]?.school,
      });

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

  static async downloadExcel(req) {
    try {
      let filter = {};
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      const visitorData = await studentCheckoutQuery.findAll(filter);

      const workBook = new ExcelJS.Workbook();
      let sheet = workBook.addWorksheet(`Student_Checkout`);

      let row1 = [
        "S.No.",
        "Student",
        "Visitor Name",
        "Reason",
        "Relationship",
        "Created At",
      ];

      sheet.addRow(row1);

      for (let checkout of visitorData) {
        let newRow = [
          visitorData.indexOf(checkout) + 1,
          checkout.student?.basicInfo?.name,
          checkout.visitorName,
          checkout.reason,
          checkout.relationship,
          new Date(checkout.createdAt).toLocaleString(),
        ];
        sheet.addRow(newRow);
      }

      // Iterate through each row and cell to apply alignment styling
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          // Apply horizontal and vertical alignment to center the content
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });
      });
      // Get the first row
      const firstRow = sheet.getRow(1);

      // Iterate through each cell in the first row and apply bold styling
      firstRow.eachCell((cell) => {
        cell.font = { bold: true };
      });

      sheet.columns.forEach((column, columnIndex) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 0
          );
        });
        column.width = maxLength + 2; // Add some extra width for padding
      });

      const filePath = path.join(__dirname, "temp.xlsx");
      const response = await workBook.xlsx.writeBuffer({
        filename: filePath,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: response,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      throw error;
    }
  }
};
