const paymentHistoryQuery = require("@db/paymentHistory/queries");
const Employee = require("@db/employee/model");
const academicsQuery = require("@db/academicYear/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const moment = require("moment");
const numberToWords = require("number-to-words");

const { compileTemplate, uploadFileToS3 } = require("../../helper/helpers");
const puppeteer = require("puppeteer");
const path = require("path");
const { default: mongoose } = require("mongoose");

module.exports = class PaymentHistoryService {
  static async downloadPdf(req) {
    try {
      const { month, year } = req.query;

      const activeAcademicYear = await academicsQuery.findOne({
        active: true,
      });
      if (!activeAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active Academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      const previousPayment = await paymentHistoryQuery.findOne({
        month,
        ...req.body,
        school: req.schoolId,
      });
      if (previousPayment) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Payment for this month has been already been created",
          responseCode: "CLIENT_ERROR",
        });
      }

      const selectedMonth = moment(month, "MMMM", true);
      if (!selectedMonth.isValid()) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Invalid month name. Use full month name format (e.g., January, February, etc.)",
          responseCode: "CLIENT_ERROR",
        });
      }
      // const selectedMonth = dayjs(month, "MMMM").startOf("month");
      const startOfMonth = selectedMonth.format("YYYY-MM-DD"); // Start date of the selected month
      const endOfMonth = selectedMonth.endOf("month").format("YYYY-MM-DD"); // End date of the selected month

      const daysInMonth = selectedMonth.daysInMonth();
      const schoolId = mongoose.Types.ObjectId(req.schoolId);
      const employeesWithAttendance = await Employee.aggregate([
        {
          $match: {
            active: true,
            school: schoolId,
          },
        },
        {
          $lookup: {
            foreignField: "employee",
            localField: "_id",
            from: "employeeattendances",
            as: "attendancecount",
            pipeline: [
              {
                $match: {
                  date: {
                    $gte: startOfMonth,
                    $lte: endOfMonth,
                  },
                },
              },
            ],
          },
        },
        {
          $lookup: {
            foreignField: "_id",
            localField: "basicInfo.designation",
            from: "designations",
            as: "designationname",
          },
        },
        {
          $lookup: {
            foreignField: "_id",
            localField: "academicInfo.department",
            from: "departments",
            as: "departmentname",
          },
        },
        {
          $lookup: {
            foreignField: "_id",
            localField: "academicInfo.salaryGrade",
            from: "salarygrades",
            as: "salaries",
          },
        },
      ]);

      let data = [];
      for (let emp of employeesWithAttendance) {
        const calculateSalaryStats = () => {
          let totalIncome = 0;
          let totalDeduction = 0;
          if (emp.salaries.length) {
            for (let b of emp.salaries[0].breakups) {
              totalIncome +=
                (b.percentage * emp.academicInfo.annualSalary) / 100;
            }

            for (let c of emp.salaries[0].deduction) {
              totalDeduction +=
                (c.percentage * emp.academicInfo.annualSalary) / 100;
            }
          }
          return {
            totalIncome,
            totalDeduction,
            grossIncome: totalIncome,
          };
        };

        const { totalIncome, totalDeduction, grossIncome } =
          calculateSalaryStats();
        const grossIncomeWords = numberToWords.toWords(grossIncome);
        let newItem = {
          basicDetails: {
            name: emp.basicInfo.empName,
            designation: emp.designationname,
            department: emp.departmentname,
            month: month,
          },
          bankDetails: {
            branch: "NA",
            bank: "NA",
            PFno: "NA",
            PANno: "NA",
            acNo: "NA",
            esiNo: "NA",
            uanNO: "NA",
            adjDays: "NA",
            totalworkingDays: emp.attendancecount.length,
            totalDaysinMonth: daysInMonth,
          },
          salaryDeatils: {
            salary: emp.salaries,
            deduction: emp.salaries.length ? emp.salaries[0].deduction : [],
            breakups: emp.salaries.length ? emp.salaries[0].breakups : [],
            totalEarning: totalIncome,
            totalDeduction: totalDeduction,
            grossIncome: grossIncome,
            grossIncomeWords: grossIncomeWords,
          },
        };

        data.push(newItem);
      }
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--mute-audio",
        ],
      });

      const page = await browser.newPage();

      const content = await compileTemplate("makePayment", {
        data: data,
        daysInMonth: daysInMonth,
        month: month,
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

      let file = {
        name: `payslip_${month}.pdf`,
        data: pdf,
        size: pdf.length,
        mimetype: "application/pdf",
      };

      let fileLink = await uploadFileToS3(file);

      let bodyData = {
        ...req.body,
        school: req.schoolId,
        data: fileLink,
        month,
        year: new Date(year).getFullYear(),
        monthlyPayments: data,
        generatedBy: req.employee._id,
      };

      await paymentHistoryQuery.create(bodyData);

      return common.successResponse({
        result: pdf,
        statusCode: httpStatusCode.ok,
        meta: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=employee_report.pdf",
          "Content-Length": pdf.length,
        },
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
      const allItems = await paymentHistoryQuery.findAll(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: allItems,
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadDeductionPdf(req) {
    try {
      const { deduction, month } = req.query;
      const paymentHistories = await paymentHistoryQuery.findOne({
        month,
        ...req.body,
        school: req.schoolId,
      });
      if (!paymentHistories)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `No payment history found for the month: ${month}`,
          responseCode: "CLIENT_ERROR",
        });

      let data = [];

      let totalIncome = 0;
      let totalDeduction = 0;

      for (let entry of paymentHistories.monthlyPayments) {
        if (
          entry.salaryDeatils.deduction &&
          entry.salaryDeatils.deduction.length > 0
        ) {
          const foundMonthlyPayment = entry.salaryDeatils.deduction.find(
            (ded) => ded.name === deduction
          );

          if (foundMonthlyPayment) {
            data.push(foundMonthlyPayment);
            totalIncome += entry.salaryDeatils.totalEarning;
            totalDeduction += entry.salaryDeatils.totalDeduction;
          }
        }
      }

      if (data.length === 0) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `No deduction found with name ${deduction} for this month.`,
          responseCode: "CLIENT_ERROR",
        });
      }

      const calculatedDeduction =
        ((totalDeduction + totalIncome) * data[0]?.percentage) / 100;

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

      const content = await compileTemplate("deductionAmount", {
        calculatedDeduction: calculatedDeduction,
        deduction: deduction,
        month: month,
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
