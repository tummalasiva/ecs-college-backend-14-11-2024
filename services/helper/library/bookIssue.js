const bookQuery = require("@db/library/book/queries");
const bookIssueQuery = require("@db/library/issue/queries");
const employeeQuery = require("@db/employee/queries");
const studentQuery = require("@db/student/queries");

const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { compileTemplate, getDateRange } = require("../../../helper/helpers");

const ExcelJS = require("exceljs");
// packages
const puppeteer = require("puppeteer");
const path = require("path");
const moment = require("moment");

module.exports = class BookIssueService {
  static async create(bodyData) {
    try {
      const { book, issuedToType, issuedTo, quantity } = bodyData;

      let requiredQuantity = parseInt(quantity);

      const bookExists = await bookQuery.findOne({ _id: book });
      if (!bookExists)
        return common.failureResponse({
          message: "Book not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      if (bookExists.leftInStock < requiredQuantity) {
        return common.failureResponse({
          message: "Not enough books in stock!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      if (issuedToType === "employee") {
        const employeeExists = await employeeQuery.findOne({ _id: issuedTo });
        if (!employeeExists)
          return common.failureResponse({
            message: "Employee not found!",
            statusCode: httpStatusCode.not_found,
            responseCode: "CLIENT_ERROR",
          });
      } else if (issuedToType === "student") {
        const studentExists = await studentQuery.findOne({ _id: issuedTo });
        if (!studentExists)
          return common.failureResponse({
            message: "Student not found!",
            statusCode: httpStatusCode.not_found,
            responseCode: "CLIENT_ERROR",
          });
      }

      let updatedBook = await bookQuery.updateOne(
        { _id: book },
        { $inc: { leftInStock: -requiredQuantity } }
      );

      let newIssue = await bookIssueQuery.create(bodyData);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Book issued successfully!",
        result: newIssue,
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
      if (filter.fromDate && filter.toDate) {
        let { endOfDay, startOfDay } = getDateRange(
          filter.fromDate,
          filter.toDate
        );
        filter["issueDate"] = { $gte: startOfDay, $lt: endOfDay };
        delete filter.fromDate;
        delete filter.toDate;
      }

      let allIssues = await bookIssueQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: allIssues,
        message: "All issued Books fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async submit(id) {
    try {
      let issueExists = await bookIssueQuery.findOne({ _id: id });
      if (!issueExists)
        return common.failureResponse({
          message: "Issue details not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      let quantity = issueExists.quantity;

      let updatedBook = await bookQuery.updateOne(
        { _id: issueExists.book._id },
        { $inc: { leftInStock: quantity } }
      );

      let updateIssueDetails = await bookIssueQuery.updateOne(
        { _id: id },
        { submissionDate: Date.now() },
        {
          new: true,
        }
      );
      if (updateIssueDetails) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Issue details updated successfully!",
          result: updateIssueDetails,
        });
      } else {
        return common.failureResponse({
          message: "Issue details not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      let issueDetails = await bookIssueQuery.findOne({ _id: id });
      if (!issueDetails)
        return common.failureResponse({
          message: "Issue details not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      let quantity = issueDetails.quantity;

      let updatedBook = await bookQuery.updateOne(
        { _id: issueDetails.book._id },
        {
          $inc: { leftInStock: quantity },
          $set: { submissionDate: new Date(Date.now()) },
        }
      );

      await bookIssueQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Issue details deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id) {
    try {
      const issueDetails = await bookIssueQuery.findOne({ _id: id });
      if (!issueDetails) {
        return common.failureResponse({
          message: "Issue details not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Issue details fetched successfully!",
        result: issueDetails,
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadExcel(req) {
    try {
      const { fromDate, toDate } = req.query;
      if (!fromDate || !toDate)
        return common.failureResponse({
          message: "Please provide date range",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let { startOfDay, endOfDay } = getDateRange(fromDate, toDate);
      let filter = { issueDate: { $gte: startOfDay, $lt: endOfDay } };

      let allIssuedBooks = await bookIssueQuery.findAll(filter);
      if (!allIssuedBooks.length)
        return common.failureResponse({
          message: "Issue details not found for the given date range!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

      const workBook = new ExcelJS.Workbook();

      const sheet = workBook.addWorksheet("Issue_Details.xlsx");

      let row1 = [
        "S.No",
        "Issued_To_User",
        "Issued_To",
        "Book_Title",
        "Quantity",
        "Issue_Date",
        "Due_Date",
        "Submission_Date",
      ];

      sheet.addRow(row1);

      for (let issue of allIssuedBooks) {
        let newRow = [
          allIssuedBooks.indexOf(issue) + 1,
          issue.issuedToType?.toUpperCase(),
          issue.issuedTo?.basicInfo?.name,
          issue.book.title,
          issue.quantity,
          new Date(issue.issueDate).toLocaleDateString(),
          new Date(issue.dueDate).toLocaleDateString(),
          issue.submissionDate
            ? new Date(issue.submissionDate).toLocaleDateString()
            : "NA",
        ];

        sheet.addRow(newRow);
      }

      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          // cell.fill = {
          //     type: "pattern",
          //     pattern: "solid",
          //     fgColor: { argb: "FFFFFF00" },
          //     bgColor: { argb: "FFFFFF00" },
          // };

          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });
      });

      const firstRow = sheet.getRow(1);
      firstRow.eachCell((cell) => (cell.font = { bold: true }));

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

  static async downloadPdf(req) {
    try {
      const { fromDate, toDate } = req.query;
      if (!fromDate || !toDate)
        return common.failureResponse({
          message: "Please provide date range",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let { startOfDay, endOfDay } = getDateRange(fromDate, toDate);
      let filter = { issueDate: { $gte: startOfDay, $lt: endOfDay } };

      let allIssuedBooks = await bookIssueQuery.findAll(filter);
      if (!allIssuedBooks.length)
        return common.failureResponse({
          message: "Issue details not found for the given date range!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });

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

      const content = await compileTemplate("stu_library_issue", {
        data: allIssuedBooks,
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
          "Content-Disposition": "attachment; filename=issue_return.pdf",
          "Content-Length": pdf.length,
        },
      });
    } catch (error) {
      throw error;
    }
  }
};
