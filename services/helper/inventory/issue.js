const issueQuery = require("@db/inventory/issue/queries");
const Sell = require("@db/inventory/sell/model");
const Issue = require("@db/inventory/issue/model");
const itemQuery = require("@db/inventory/item/queries");
const transactionQuery = require("@db/inventory/transaction/queries");
const departmentQuery = require("@db/department/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const {
  notFoundError,
  compileTemplate,
  getDateRange,
} = require("../../../helper/helpers");
const schoolQuery = require("@db/school/query");
const studentQuery = require("@db/student/queries");
const employeeQuery = require("@db/employee/queries");
const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");

module.exports = class IssueService {
  static async create(req) {
    const {
      item,
      quantity,
      fromSchool,
      issuedToRoleName,
      studentId,
      employeeId,
      status,
      notes,
    } = req.body;
    try {
      const [itemData, schoolData, transactionData] = await Promise.all([
        itemQuery.findOne({ _id: item }),
        schoolQuery.findOne({
          _id: fromSchool,
        }),
        transactionQuery.findOne({
          item: mongoose.Types.ObjectId(item),
        }),
      ]);
      if (!itemData)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Item not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (!schoolData)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "From School not found!",
          responseCode: "CLIENT_ERROR",
        });

      const transQ = transactionData.quantity;
      const transPerCost = transactionData.pricePerItem;
      const issueQuantity = await Issue.aggregate([
        {
          $match: {
            item: mongoose.Types.ObjectId(item),
            status: { $in: ["Issued", "Pending"] },
          },
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$quantity" },
          },
        },
      ]);

      const sellQuantity = await Sell.aggregate([
        {
          $match: {
            item: mongoose.Types.ObjectId(item),
            status: { $in: ["Sold", "Pending"] },
          },
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$quantity" },
          },
        },
      ]);

      const totalIssueQuantity = issueQuantity.length
        ? issueQuantity[0].totalQuantity
        : 0;
      const totalSellQuantity = sellQuantity.length
        ? sellQuantity[0].totalQuantity
        : 0;

      const currentQuantity = totalIssueQuantity + totalSellQuantity;

      balancequantity = transQ - currentQuantity;

      let allInTransactions = await transactionQuery.findAll({
        type: "In",
        item: item,
      });
      if (!allInTransactions.length)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "This item is not present in stock!",
          responseCode: "CLIENT_ERROR",
        });
      let allOutTransactions = await transactionQuery.findAll({
        type: "Out",
        item: item,
      });

      let totalNumberOfItemsIn = 0;
      let totalNumberOfItemsOut = 0;
      for (let trans of allInTransactions) {
        totalNumberOfItemsIn += trans.quantity;
      }
      for (let trans of allOutTransactions) {
        totalNumberOfItemsOut += trans.quantity;
      }

      let eachItemPrice = allInTransactions[0].pricePerItem;
      let leftQuantity = totalNumberOfItemsIn - totalNumberOfItemsOut;

      if (balancequantity < quantity)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: `Requested quantity is more than what is left in stock i.e ${balancequantity}`,
          responseCode: "CLIENT_ERROR",
        });

      if (issuedToRoleName === "STUDENT") {
        if (!studentId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Student Id not provided!",
            responseCode: "CLIENT_ERROR",
          });
        let student = await studentQuery.findOne({ _id: studentId });
        if (!student)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Student not found!",
            responseCode: "CLIENT_ERROR",
          });
        req.body.issuedTo = studentId;
      } else {
        if (!employeeId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Employee Id not provided!",
            responseCode: "CLIENT_ERROR",
          });
        let employee = await employeeQuery.findOne({
          _id: employeeId,
        });
        if (!employee)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Employee with given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        req.body.issuedTo = employeeId;
      }
      let newIssue = await issueQuery.create({
        fromSchool: fromSchool,
        issuedAt: Date.now(),
        issuedBy: req.employee._id,
        issuedTo: req.body.issuedTo,
        issuedToRoleName,
        item: item,
        pricePerItem: eachItemPrice,
        quantity,
        status,
        notes,
        school: req.schoolId,
      });

      let newSavedIssue = await issueQuery.findOne({ _id: newIssue._id });

      return common.successResponse({
        result: newSavedIssue,
        statusCode: httpStatusCode.ok,
        message: "Item has been issued successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(req) {
    try {
      const { status } = req.body;

      const updatedIssue = await issueQuery.updateOne(
        { _id: req.params.id },
        { $set: { status } },
        { new: true }
      );
      if (!updatedIssue)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Issue to update was not found!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        data: updatedIssue,
        message: "Issue status updated successfully!",
        success: true,
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
      const issueList = await issueQuery.findAll({
        ...filter,
      });

      return common.successResponse({
        result: issueList,
        message: "Issue list fetched successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadPdf(req) {
    try {
      const { search = {} } = req.query;

      const filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      const [schoolData, issueData] = await Promise.all([
        schoolQuery.findOne({
          _id: req.schoolId,
        }),
        issueQuery.findAll(filter),
      ]);

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
      const content = await compileTemplate("inventoryIssue", {
        setting: schoolData,
        data: issueData,
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
        message: "Issue list fetched successfully!",
        result: pdf,
        meta: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=issues.pdf",
          "Content-Length": pdf.length,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadExcel(req) {
    try {
      const { search = {} } = req.query;
      const issueData = await issueQuery.findAll({
        ...search,
        school: req.schoolId,
      });

      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.aoa_to_sheet([
        [
          "Serial Number",
          "Item Id",
          "Item Name",
          "Issuer Name",
          "Total Quantity",
        ],
        ...issueData.map((data, index) => [
          index + 1,
          data.item.itemId,
          data.item.name,
          data.issuedBy.basicInfo.empName,
          data.total,
        ]),
      ]);

      xlsx.utils.book_append_sheet(workbook, worksheet, "InventoryIssue");

      if (!workbook.SheetNames.length) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No data to download",
          responseCode: "CLIENT_ERROR",
        });
      }

      const excelBuffer = xlsx.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      // Set response headers to trigger download

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Issue list fetched successfully!",
        result: excelBuffer,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=issues.xlsx",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getTotalInventoryAmount(req) {
    const { fromDate, toDate } = req.query;
    try {
      const { startOfDay, endOfDay } = getDateRange(fromDate, toDate);

      let filter = {
        createdAt: { $gte: startOfDay, $lt: endOfDay },
        school: req.schoolId,
      };
      let alltransaction = await transactionQuery.findAll(filter).lean();

      let issueQuantity = await issueQuery.findAll({
        school: req.schoolId,
        issuedAt: { $gte: startOfDay, $lt: endOfDay },
      });

      let sellQuantity = await sellQuery.findAll({
        school: req.schoolId,
        soldAt: { $gte: startOfDay, $lt: endOfDay },
      });

      const totalIssueQuantity = issueQuantity.length
        ? issueQuantity[0].total
          ? issueQuantity[0].total
          : 0
        : 0;

      const totalSellQuantity = sellQuantity.length
        ? sellQuantity[0].total
          ? sellQuantity[0].total
          : 0
        : 0;

      const totalAmount = totalIssueQuantity + totalSellQuantity;
      const balanceAmount =
        (alltransaction.length
          ? alltransaction[0].total
            ? alltransaction[0].total
            : 0
          : 0) - totalSellQuantity;
      return common.successResponse({
        result: {
          balanceAmount,
          totalIssueQuantity,
        },
        statusCode: httpStatusCode.ok,
        message: "Stock fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
