const feeMapQuery = require("@db/fee/feeMap/queries");
const receiptTitleQuery = require("@db/fee/receiptTitle/queries");
const pastDuesQuery = require("@db/fee/pastFeeDue/queries");
const receiptQuery = require("@db/fee/receipt/queries");
const feeMapCategoryQuery = require("@db/fee/feeMapCategory/queries");
const academicYearQuery = require("@db/academicYear/queries");
const studentQuery = require("@db/student/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const Receipt = require("@db/fee/receipt/model");
const schoolQuery = require("@db/school/queries");

const moment = require("moment");
const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");
const mongoose = require("mongoose");
const { ToWords } = require("to-words");
const path = require("path");
const {
  compileTemplate,
  getDateRange,
  notFoundError,
} = require("../../../helper/helpers");
const Student = require("../../../db/student/model");

const generateReceiptNumber = async (schoolId, receiptTitle) => {
  let currentReceiptCount = await Receipt.count({
    school: schoolId,
    "receiptTitle.id": receiptTitle,
  });

  currentReceiptCount = currentReceiptCount === 0 ? 1 : currentReceiptCount + 1;

  return currentReceiptCount;
};

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      // can be used to override defaults for the selected locale
      name: "Rupee",
      plural: "Rupees",
      symbol: "₹",
      fractionalUnit: {
        name: "Paisa",
        plural: "Paise",
        symbol: "",
      },
    },
  },
});

const amountInWords = (amount) => {
  let words = toWords.convert(amount);
  return words;
};

module.exports = class FeeReceiptService {
  // done
  static async getStudentsList(req) {
    try {
      const { feeMapId, classId, sectionId } = req.query.search;
      const feeMapFilter = {
        active: true,
        school: req.schoolId,
      };

      if (feeMapId) {
        feeMapFilter._id = feeMapId;
      }

      const feeMapWithGivenId = await feeMapQuery.findOne(feeMapFilter);
      if (!feeMapWithGivenId) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Fee map with the given id was not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const filter = {
        active: true,
        academicYear: (await academicYearQuery.findOne({ active: true }))._id,
      };

      if (!filter.academicYear) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active academic year not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const dependencies = feeMapWithGivenId.extendedDependencies;
      if (
        dependencies.includes("class") ||
        dependencies.includes("classOld") ||
        dependencies.includes("classNew")
      ) {
        filter["academicInfo.class"] = feeMapWithGivenId.class;
      } else {
        filter["academicInfo.class"] = classId;
      }
      if (dependencies.includes("hostel")) {
        filter["hostelInfo.hostel"] = feeMapWithGivenId.hostel;
        filter["otherInfo.hostelMember"] = true;
      }
      if (dependencies.includes("route") && feeMapWithGivenId.route) {
        filter["transportInfo.route"] = feeMapWithGivenId.route;
      }
      if (dependencies.includes("stop") && feeMapWithGivenId.stop) {
        filter["transportInfo.stop"] = feeMapWithGivenId.stop;
      }
      if (dependencies.includes("pickType") && feeMapWithGivenId.pickType) {
        filter["transportInfo.pickType"] = feeMapWithGivenId.pickType;
      }
      if (sectionId) {
        filter["academicInfo.section"] = sectionId;
      }

      const students = await studentQuery.findAll(filter);

      let finalListOfStudents = [];
      if (
        dependencies.includes("classNew") ||
        dependencies.includes("classOld")
      ) {
        const admissionNumbers = students.map(
          (student) => student.academicInfo.admissionNumber
        );
        const admissionCounts = await Student.aggregate([
          {
            $match: {
              "academicInfo.admissionNumber": { $in: admissionNumbers },
            },
          },
          {
            $group: {
              _id: "$academicInfo.admissionNumber",
              count: { $sum: 1 },
            },
          },
        ]);

        const countMap = admissionCounts.reduce((acc, cur) => {
          acc[cur._id] = cur.count;
          return acc;
        }, {});

        finalListOfStudents = students.filter((student) => {
          const count = countMap[student.academicInfo.admissionNumber] || 0;
          if (dependencies.includes("classNew")) {
            return count === 1;
          }
          if (dependencies.includes("classOld")) {
            return count > 1;
          }
        });
      } else {
        finalListOfStudents = students;
      }

      return common.successResponse({
        result: finalListOfStudents,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      return common.failureResponse({
        statusCode: httpStatusCode.internal_server_error,
        message: error.message,
        responseCode: "SERVER_ERROR",
      });
    }
  }

  // done
  static async getFeeDetails(req) {
    const { receiptTitleId, feeMapId, studentId, installmentId } = req.query;

    try {
      const [receiptTitleWithGivenId, feeMapWithGivenIdAndReceiptTitleId] =
        await Promise.all([
          receiptTitleQuery.findOne({
            _id: receiptTitleId,
            active: true,
          }),
          feeMapQuery.findOne({
            _id: feeMapId,
            receiptTitle: receiptTitleId,
            active: true,
          }),
        ]);

      if (!receiptTitleWithGivenId)
        return notFoundError("Receipt book not found!");

      if (!feeMapWithGivenIdAndReceiptTitleId)
        return notFoundError("Fee map not found!");

      let student = await studentQuery.findOne({
        _id: studentId,
        active: true,
      });

      if (!student)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student with the given details was not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (
        feeMapWithGivenIdAndReceiptTitleId.extendedDependencies.includes(
          "classNew"
        )
      ) {
        let newAdmission = await Student.count({
          "academicInfo.admissionNumber": student.academicInfo.admissionNumber,
        }).lean();
        if (newAdmission > 1)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "This student is an old admission!",
            responseCode: "CLIENT_ERROR",
          });
      }

      if (
        feeMapWithGivenIdAndReceiptTitleId.extendedDependencies.includes(
          "classOld"
        )
      ) {
        let newAdmission = await Student.count({
          "academicInfo.admissionNumber": student.academicInfo.admissionNumber,
        }).lean();

        if (newAdmission == 1)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "This student is a new admission!",
            responseCode: "CLIENT_ERROR",
          });
      }

      let currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      let pastDueForPreviousAcademicYears = await pastDuesQuery.findAll({
        feeMap: feeMapId,
        cleared: false,
        academicYear: { $ne: currentAcademicYear._id },
        payeeAdmissionNumber: student.academicInfo.admissionNumber,
      });

      let pastDues = [...pastDueForPreviousAcademicYears]
        .map((d) => d.feePaidDetails)
        .reduce((total, current) => total + parseFloat(current.dueAmount), 0);

      let feeMapCategories = await feeMapCategoryQuery.findAll({
        feeMap: feeMapId,
      });

      if (!feeMapCategories.length)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Fee map categories not found for this fee map!",
          responseCode: "CLIENT_ERROR",
        });

      let feeParticularsForPastDue =
        pastDues > 0
          ? feeMapCategories.map((f) => ({
              ...f,
              amount: parseFloat(
                (
                  (f.amount / feeMapWithGivenIdAndReceiptTitleId.fee) *
                  Number(pastDues)
                ).toFixed(2)
              ),
              amountPaid: parseFloat(
                (
                  (f.amount / feeMapWithGivenIdAndReceiptTitleId.fee) *
                  Number(pastDues)
                ).toFixed(2)
              ),
            }))
          : [];

      // console.log(feeParticularsForPastDue, "fppd");

      let amountInFeeMapCategories = feeMapCategories.reduce(
        (total, current) => total + parseFloat(current.amount),
        0
      );
      let totalFeeMapFee = parseFloat(feeMapWithGivenIdAndReceiptTitleId.fee);

      if (amountInFeeMapCategories !== totalFeeMapFee)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Total fee in fee map categories does not match with total fee in fee map!",
          responseCode: "CLIENT_ERROR",
        });

      let previousReceipts = await receiptQuery.findAll({
        feeMap: feeMapId,
        "payeeDetails.id": studentId,
      });

      let installmentIdsPaidUntilNow =
        previousReceipts.length > 0
          ? previousReceipts.map((r) => r.installmentPaid?.toString())
          : [];
      let previousAmountPaid = 0;

      for (let receipt of previousReceipts) {
        previousAmountPaid += receipt.feeParticulars.reduce(
          (total, current) => total + parseFloat(current.amount),
          0
        );

        // if (receipt.partiallyPaid) {
        //   previousAmountPaid += receipt.partialPaymentCompleted
        //     ? receipt.partialAmount
        //     : 0;
        // }
      }
      let totalDueForThisAcademicYear =
        feeMapWithGivenIdAndReceiptTitleId.fee - previousAmountPaid;

      let isCurrentInstallmentPaid = false;
      if (
        previousReceipts.find(
          (r) => r.installmentPaid?.toString() === installmentId
        )
      ) {
        isCurrentInstallmentPaid = true;
      }

      let unpaidInstallments =
        feeMapWithGivenIdAndReceiptTitleId.installments.filter((i) =>
          installmentIdsPaidUntilNow.includes(i._id?.toString())
        );

      let installmentToBePaid = isCurrentInstallmentPaid
        ? unpaidInstallments[0]?._id?.toString()
        : installmentId;

      let currentDue = 0;
      let pastDueDoc = null;

      let receiptWithGivenInstallmentId = previousReceipts.length
        ? previousReceipts.find(
            (r) => r.installmentPaid?.toString() === installmentId
          )
        : null;
      if (receiptWithGivenInstallmentId) {
        pastDueDoc = await pastDuesQuery.findOne({
          receipt: receiptWithGivenInstallmentId._id,
          cleared: false,
          academicYear: currentAcademicYear._id,
          payeeAdmissionNumber: student.academicInfo.admissionNumber,
        });
        currentDue =
          receiptWithGivenInstallmentId.partiallyPaid &&
          !receiptWithGivenInstallmentId.partialPaymentCompleted
            ? pastDueDoc?.feePaidDetails?.reduce(
                (t, c) => t + parseFloat(c.dueAmount),
                0
              ) || 0
            : 0;
      } else {
        currentDue = feeMapWithGivenIdAndReceiptTitleId.installments.filter(
          (i) => i._id.toHexString() == installmentId
        )[0]?.amount;
      }

      feeMapCategories = feeMapCategories.map((f) => ({
        ...f,
        amount: pastDueDoc
          ? parseFloat(
              pastDueDoc.feePaidDetails.find(
                (ft) => ft.feeMapCategory.toHexString() === f._id.toHexString()
              )?.dueAmount || 0
            )
          : parseFloat(
              (
                (f.amount / feeMapWithGivenIdAndReceiptTitleId.fee) *
                Number(currentDue)
              ).toFixed(2)
            ),
        amountPaid: pastDueDoc
          ? parseFloat(
              pastDueDoc.feePaidDetails.find(
                (ft) =>
                  ft.feeMapCategory?.toHexString() === f._id?.toHexString()
              )?.dueAmount || 0
            )
          : parseFloat(
              (
                (f.amount / feeMapWithGivenIdAndReceiptTitleId.fee) *
                Number(currentDue)
              ).toFixed(2)
            ),
      }));

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: {
          totalPaid: previousAmountPaid,
          pastDues,
          feeParticularsForPastDue,
          currentDue,
          totalPaid: previousAmountPaid,
          totalDueForThisAcademicYear,
          feeMap: feeMapWithGivenIdAndReceiptTitleId,
          feeMapCategories: feeMapCategories,
          previousReceipts,
          student,
          currentInstallment: installmentToBePaid,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // done
  static async collectFees(req) {
    try {
      const {
        feeMapId,
        studentId,
        installmentId,
        feeParticulars,
        penalty,
        miscellaneous,
        paymentMode,
        ddDetails,
        upiDetails,
        cardDetails,
        chequeDetails,
        netBankingDetails,
        concessionDetails,
        note,
        payingDate,
      } = req.body;
      const { schoolId } = req;

      if (!Array.isArray(feeParticulars) || !paymentMode) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid fee particulars or payment mode provided",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (paymentMode === "Upi" && (!upiDetails.upiApp || !upiDetails.utrNo)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Please provide all the details mentioned in UPI payment mode",
          responseCode: "CLIENT_ERROR",
        });
      }

      for (const { amount, amountPaid } of feeParticulars) {
        if (amountPaid > amount) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message:
              "Amount paid cannot be more than amount for each fee category",
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      const [
        feeMapWithTheGivenId,
        school,
        currentAcademicYear,
        student,
        receiptWithThisInstallmentPaid,
      ] = await Promise.all([
        feeMapQuery.findOne({ _id: feeMapId, school: schoolId }),
        schoolQuery.findOne({ _id: schoolId }),
        academicYearQuery.findOne({ active: true }),
        studentQuery.findOne({ _id: studentId }),
        receiptQuery.findOne({
          "payeeDetails.id": studentId,
          installmentPaid: installmentId,
        }),
      ]);

      if (!feeMapWithTheGivenId || !school || !currentAcademicYear) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Invalid fee map id or school not found or no active academic year",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (
        receiptWithThisInstallmentPaid &&
        !receiptWithThisInstallmentPaid.partiallyPaid
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "This installment has already been paid",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (
        receiptWithThisInstallmentPaid &&
        receiptWithThisInstallmentPaid.partiallyPaid &&
        receiptWithThisInstallmentPaid.partialPaymentCompleted
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "This installment has already been paid",
          responseCode: "CLIENT_ERROR",
        });
      }

      const installmentToBePaid = feeMapWithTheGivenId.installments.find(
        (i) => i._id.toHexString() === installmentId
      );

      if (!installmentToBePaid) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Installment to be paid was not found",
          responseCode: "CLIENT_ERROR",
        });
      }

      const totalPaymentMadeInFeeParticulars = feeParticulars.reduce(
        (total, { amountPaid }) => total + parseFloat(amountPaid),
        0
      );
      const currentDue = feeParticulars.reduce(
        (total, { amount }) => total + parseFloat(amount),
        0
      );

      const isPartialyPaid = totalPaymentMadeInFeeParticulars !== currentDue;
      const partialDue = currentDue - totalPaymentMadeInFeeParticulars;

      let allAmountBeingPaid =
        parseFloat(totalPaymentMadeInFeeParticulars) +
        parseFloat(penalty || 0) +
        parseFloat(miscellaneous || 0);

      const { amount, referredBy, givenAs } = concessionDetails;
      if (givenAs === "Percentage" && amount > 100) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Concession percentage cannot be more than 100%",
          responseCode: "CLIENT_ERROR",
        });
      }

      let modifiedConcessionObject = {};
      let amountToBeReducedAsConcession = 0;
      if (Object.keys(concessionDetails).length) {
        amountToBeReducedAsConcession =
          givenAs === "Percentage"
            ? (Number(amount) * allAmountBeingPaid) / 100
            : Number(amount);
        modifiedConcessionObject = {
          amount: amountToBeReducedAsConcession.toFixed(2),
          referredBy,
          givenAs,
        };
      }

      if (amountToBeReducedAsConcession > allAmountBeingPaid) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Concession amount cannot be more than total amount being paid",
          responseCode: "CLIENT_ERROR",
        });
      }

      const totalAmountBeingPaid =
        allAmountBeingPaid - parseFloat(amountToBeReducedAsConcession || 0);

      const modifiedFeeParticulars = feeParticulars.map(
        ({ _id, name, amountPaid, description }) => ({
          feeMapCategory: _id,
          name,
          amount: parseFloat(amountPaid),
          description,
        })
      );

      const payeeDetails = {
        id: student._id,
        name: student.basicInfo.name,
        contactNumber: student.contactNumber,
        academicYearId: currentAcademicYear._id,
        sectionId: student.academicInfo?.section?._id,
        classId: student.academicInfo?.class?._id,
        admissionNumber: student.academicInfo?.admissionNumber,
        rollNumber: student.academicInfo?.rollNumber,
        className: student.academicInfo?.class?.name,
        parentName: student.fatherInfo?.name,
        sectionName: student.academicInfo?.section?.name,
      };

      const newReceipt = {
        school: schoolId,
        receiptNumber: await generateReceiptNumber(
          schoolId,
          feeMapWithTheGivenId.receiptTitle._id
        ),
        note,
        receiptTitle: {
          id: feeMapWithTheGivenId.receiptTitle._id,
          name: feeMapWithTheGivenId.receiptTitle.name,
          academicYearFrom: currentAcademicYear.from,
          academicYearTo: currentAcademicYear.to,
        },
        feeMap: feeMapId,
        payeeDetails,
        schoolDetails: school._id,
        feeParticulars: modifiedFeeParticulars,
        penalty: parseFloat(penalty),
        miscellaneous: parseFloat(miscellaneous),
        paymentMode,
        amountPaid: parseFloat(totalAmountBeingPaid.toFixed(2)),
        amountPaidInWords: amountInWords(totalAmountBeingPaid),
        paidAt: payingDate
          ? moment(payingDate, "DD/MM/YYYY").toDate()
          : Date.now(),
        collectedBy: req.employee._id,
        ddDetails,
        upiDetails,
        chequeDetails,
        netBankingDetails,
        cardDetails,
        installmentPaid: installmentId,
        concessionDetails: modifiedConcessionObject,
        partialAmount: isPartialyPaid ? partialDue.toFixed(2) : 0,
        partialPaymentCompleted: false,
        partiallyPaid: isPartialyPaid,
      };

      let createdReceipt = await receiptQuery.create(newReceipt);

      if (isPartialyPaid && !receiptWithThisInstallmentPaid) {
        let dueFeeParticulars = [];
        for (let particular of feeParticulars) {
          const { amount, amountPaid } = particular;
          let dueAmount = parseFloat(amount) - parseFloat(amountPaid);
          if (dueAmount > 0) {
            let newItem = {
              feeMapCategory: particular._id,
              dueAmount,
            };
            dueFeeParticulars.push(newItem);
          }
        }

        await pastDuesQuery.create({
          academicYear: currentAcademicYear._id,
          feeMap: feeMapId,
          payeeAdmissionNumber: student.academicInfo.admissionNumber,
          installmentId,
          feePaidDetails: dueFeeParticulars,
          receipt: createdReceipt._id,
          cleared: !dueFeeParticulars.length,
          paidAt: dueFeeParticulars.length ? Date.now() : null,
        });
      } else if (
        receiptWithThisInstallmentPaid &&
        receiptWithThisInstallmentPaid.partiallyPaid &&
        !receiptWithThisInstallmentPaid.partialPaymentCompleted
      ) {
        let dueFeeParticulars = [];
        for (let particular of feeParticulars) {
          const { amount, amountPaid } = particular;
          let dueAmount = parseFloat(amount) - parseFloat(amountPaid);
          if (dueAmount > 0) {
            let newItem = {
              feeMapCategory: particular._id,
              dueAmount,
            };
            dueFeeParticulars.push(newItem);
          }
        }

        await pastDuesQuery.updateOne(
          {
            receipt: receiptWithThisInstallmentPaid._id,
            feeMap: feeMapId,
            cleared: false,
          },
          {
            feePaidDetails: dueFeeParticulars,
            cleared: !dueFeeParticulars.length,
            paidAt: dueFeeParticulars.length ? Date.now() : null,
          }
        );

        let receiptsWithThisInstallmentAndPayee = await receiptQuery.findAll({
          installmentPaid: installmentId,
          payeeAdmissionNumber: student.academicInfo.admissionNumber,
          feeMap: feeMapId,
        });

        if (!dueFeeParticulars.length) {
          await receiptQuery.updateMany(
            {
              _id: {
                $in: receiptsWithThisInstallmentAndPayee.map((r) => r._id),
              },
            },
            { $set: { partialPaymentCompleted: true } }
          );
        }
      }

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
      const content = await compileTemplate("feeReceipt", {
        ...newReceipt,
        paidAt: moment(new Date(newReceipt.paidAt)).format("DD/MM/YYYY"),
        school,
        concession: modifiedConcessionObject?.amount,
      });

      await page.setContent(content);
      const pdf = await page.pdf({ format: "A4", landscape: true });
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

  // done
  static async previewReceipt(req) {
    try {
      const {
        feeMapId,
        studentId,
        installmentId,
        feeParticulars,
        penalty,
        miscellaneous,
        paymentMode,
        ddDetails,
        upiDetails,
        cardDetails,
        chequeDetails,
        netBankingDetails,
        concessionDetails,
        note,
        payingDate,
      } = req.body;
      const { schoolId } = req;

      if (!Array.isArray(feeParticulars) || !paymentMode) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid fee particulars or payment mode provided",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (paymentMode === "Upi" && (!upiDetails.upiApp || !upiDetails.utrNo)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Please provide all the details mentioned in UPI payment mode",
          responseCode: "CLIENT_ERROR",
        });
      }

      for (const { amount, amountPaid } of feeParticulars) {
        if (amountPaid > amount) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message:
              "Amount paid cannot be more than amount for each fee category",
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      const [
        feeMapWithTheGivenId,
        school,
        currentAcademicYear,
        student,
        receiptWithThisInstallmentPaid,
      ] = await Promise.all([
        feeMapQuery.findOne({ _id: feeMapId, school: schoolId }),
        schoolQuery.findOne({ _id: schoolId }),
        academicYearQuery.findOne({ active: true }),
        studentQuery.findOne({ _id: studentId }),
        receiptQuery.findOne({
          "payeeDetails.id": studentId,
          installmentPaid: installmentId,
        }),
      ]);

      if (!feeMapWithTheGivenId || !school || !currentAcademicYear) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Invalid fee map id or school not found or no active academic year",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (
        receiptWithThisInstallmentPaid &&
        !receiptWithThisInstallmentPaid.partiallyPaid
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "This installment has already been paid",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (
        receiptWithThisInstallmentPaid &&
        receiptWithThisInstallmentPaid.partiallyPaid &&
        receiptWithThisInstallmentPaid.partialPaymentCompleted
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "This installment has already been paid",
          responseCode: "CLIENT_ERROR",
        });
      }

      const installmentToBePaid = feeMapWithTheGivenId.installments.find(
        (i) => i._id.toHexString() === installmentId
      );

      if (!installmentToBePaid) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Installment to be paid was not found",
          responseCode: "CLIENT_ERROR",
        });
      }

      const totalPaymentMadeInFeeParticulars = feeParticulars.reduce(
        (total, { amountPaid }) => total + parseFloat(amountPaid),
        0
      );
      const currentDue = feeParticulars.reduce(
        (total, { amount }) => total + parseFloat(amount),
        0
      );

      const isPartialyPaid = totalPaymentMadeInFeeParticulars !== currentDue;
      const partialDue = currentDue - totalPaymentMadeInFeeParticulars;

      let allAmountBeingPaid =
        parseFloat(totalPaymentMadeInFeeParticulars) +
        parseFloat(penalty || 0) +
        parseFloat(miscellaneous || 0);

      const { amount, referredBy, givenAs } = concessionDetails;
      if (givenAs === "Percentage" && amount > 100) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Concession percentage cannot be more than 100%",
          responseCode: "CLIENT_ERROR",
        });
      }

      let modifiedConcessionObject = {};
      let amountToBeReducedAsConcession = 0;
      if (Object.keys(concessionDetails).length) {
        amountToBeReducedAsConcession =
          givenAs === "Percentage"
            ? (Number(amount) * allAmountBeingPaid) / 100
            : Number(amount);
        modifiedConcessionObject = {
          amount: amountToBeReducedAsConcession.toFixed(2),
          referredBy,
          givenAs,
        };
      }

      if (amountToBeReducedAsConcession > allAmountBeingPaid) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Concession amount cannot be more than total amount being paid",
          responseCode: "CLIENT_ERROR",
        });
      }

      const totalAmountBeingPaid =
        allAmountBeingPaid - parseFloat(amountToBeReducedAsConcession || 0);

      const modifiedFeeParticulars = feeParticulars.map(
        ({ _id, name, amountPaid, description }) => ({
          feeMapCategory: _id,
          name,
          amount: parseFloat(amountPaid),
          description,
        })
      );

      const payeeDetails = {
        id: student._id,
        name: student.basicInfo.name,
        contactNumber: student.contactNumber,
        academicYearId: currentAcademicYear._id,
        sectionId: student.academicInfo?.section?._id,
        classId: student.academicInfo?.class?._id,
        admissionNumber: student.academicInfo?.admissionNumber,
        rollNumber: student.academicInfo?.rollNumber,
        className: student.academicInfo?.class?.name,
        parentName: student.fatherInfo?.name,
        sectionName: student.academicInfo?.section?.name,
      };

      const newReceipt = {
        school: schoolId,
        receiptNumber: await generateReceiptNumber(
          schoolId,
          feeMapWithTheGivenId.receiptTitle._id
        ),
        note,
        receiptTitle: {
          id: feeMapWithTheGivenId.receiptTitle._id,
          name: feeMapWithTheGivenId.receiptTitle.name,
          academicYearFrom: currentAcademicYear.from,
          academicYearTo: currentAcademicYear.to,
        },
        feeMap: feeMapId,
        payeeDetails,
        schoolDetails: school._id,
        feeParticulars: modifiedFeeParticulars,
        penalty: parseFloat(penalty),
        miscellaneous: parseFloat(miscellaneous),
        paymentMode,
        amountPaid: parseFloat(totalAmountBeingPaid.toFixed(2)),
        amountPaidInWords: amountInWords(totalAmountBeingPaid),
        paidAt: payingDate
          ? moment(payingDate, "DD/MM/YYYY").toDate()
          : Date.now(),
        collectedBy: req.employee._id,
        ddDetails,
        upiDetails,
        chequeDetails,
        netBankingDetails,
        cardDetails,
        installmentPaid: installmentId,
        concessionDetails: modifiedConcessionObject,
        partialAmount: isPartialyPaid ? partialDue.toFixed(2) : 0,
        partialPaymentCompleted: false,
        partiallyPaid: isPartialyPaid,
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
      const content = await compileTemplate("feeReceiptNew", {
        ...newReceipt,
        paidAt: moment(new Date(newReceipt.paidAt)).format("DD/MM/YYYY"),
        school,
        concession: modifiedConcessionObject?.amount,
      });

      await page.setContent(content);
      const pdf = await page.pdf({ format: "A4", landscape: true });
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

  static async getReceiptsPaidWithCheque(req) {
    try {
      let receipts = await receiptQuery.findAll({
        $or: [
          {
            schoolDetails: req.schoolId,
            paymentMode: "Cheque",
            reconciliationStatus: "Null",
          },
          {
            schoolDetails: req.schoolId,
            paymentMode: "Cheque",
            reconciliationStatus: "Rejected",
          },
        ],
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Receipts paid with cheque fetched successfully!",
        result: receipts,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateSingleReceiptReconciliationStatus(req) {
    try {
      const { action } = req.body;

      if (action !== "Approve" && action !== "Reject")
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid action. It should be one of 'Approve' and 'Reject'",
          responseCode: "CLIENT_ERROR",
        });

      let status = action === "Approve" ? "Approved" : "Rejected";

      const filter = { _id: req.params.id };
      const updateOperation = [
        {
          $set: { reconciliationStatus: status },
        },
      ];

      let updatedReceipt = await receiptQuery.updateOne(
        filter,
        updateOperation,
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Reconciliation status updated successfully!",
        result: updatedReceipt,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateMultipleReceiptReconciliationStatus(req) {
    try {
      const { receiptIds = [], action } = req.body;

      if (action !== "Approve" && action !== "Reject")
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid action. It should be one of 'Approve' and 'Reject'",
          responseCode: "CLIENT_ERROR",
        });

      if (
        receiptIds.filter((id) => !mongoose.Types.ObjectId.isValid(id)).length
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "One or many of the provided receipt Ids is invalid!",
          responseCode: "CLIENT_ERROR",
        });
      }

      let status = action === "Approve" ? "Approved" : "Rejected";

      const filter = { _id: { $in: receiptIds } };
      const updateOperation = [
        {
          $set: { reconciliationStatus: status },
        },
      ];

      let updatedReceipts = await receiptQuery.updateMany(
        filter,
        updateOperation
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Reconciliation status updated successfully!",
        result: updatedReceipts,
      });
    } catch (error) {
      throw error;
    }
  }

  // done
  static async getAmountCollectedWithDifferentModes(req) {
    const {
      academicYearId,
      cashierId,
      receiptTitleId,
      feeMapId,
      fromDate,
      toDate,
      sectionId,
      classId,
    } = req.query;

    try {
      const filter = {
        "payeeDetails.academicYearId": new mongoose.Types.ObjectId(
          academicYearId
        ),
        school: new mongoose.Types.ObjectId(req.schoolId),
      };
      if (cashierId !== "all") {
        filter["collectedBy"] = new mongoose.Types.ObjectId(cashierId);
      }
      if (receiptTitleId !== "all") {
        filter["receiptTitle.id"] = new mongoose.Types.ObjectId(receiptTitleId);
      }

      if (feeMapId !== "all") {
        filter["feeMap"] = new mongoose.Types.ObjectId(feeMapId);
      }

      if (classId !== "all") {
        filter["payeeDetails.classId"] = mongoose.Types.ObjectId(classId);
      }

      if (sectionId !== "all") {
        filter["payeeDetails.sectionId"] = new mongoose.Types.ObjectId(
          sectionId
        );
      }

      if (fromDate && toDate) {
        const { startOfDay, endOfDay } = getDateRange(fromDate, toDate);

        filter["paidAt"] = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }

      const results = await Receipt.aggregate([
        {
          $match: {
            ...filter,
          },
        },
        {
          $group: {
            _id: "$paymentMode",
            totalAmountPaid: { $sum: "$amountPaid" },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            paymentModeTotals: {
              $push: {
                paymentMode: "$_id",
                totalAmountPaid: "$totalAmountPaid",
                count: "$count",
              },
            },
            totalCollectedAmount: { $sum: "$totalAmountPaid" },
          },
        },
      ]);

      if (!results.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No payment collected for the given credentials!",
          responseCode: "CLIENT_ERROR",
        });

      const totalPaymentsModes = results[0].paymentModeTotals;

      let finalResult = totalPaymentsModes.reduce((result, obj) => {
        const { paymentMode, totalAmountPaid } = obj;
        if (result.hasOwnProperty(paymentMode)) {
          result[paymentMode] += totalAmountPaid;
        } else {
          result[paymentMode] = totalAmountPaid;
        }

        return result;
      }, {});

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: { results, finalResult },
      });
    } catch (error) {
      throw error;
    }
  }

  // done
  static async getBalanceFeeReport(req) {
    try {
      const { academicYearId, feeMapId, classId, sectionId } = req.query;
      const feeMapFilter = {
        active: true,
        school: req.schoolId,
      };

      if (feeMapId) {
        feeMapFilter._id = feeMapId;
      }

      const feeMapWithGivenId = await feeMapQuery.findOne(feeMapFilter);
      if (!feeMapWithGivenId) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Fee map with the given id was not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const filter = {
        active: true,
        academicYear: (await academicYearQuery.findOne({ _id: academicYearId }))
          ._id,
      };

      if (!filter.academicYear) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active academic year not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const dependencies = feeMapWithGivenId.extendedDependencies;
      if (
        dependencies.includes("class") ||
        dependencies.includes("classOld") ||
        dependencies.includes("classNew")
      ) {
        filter["academicInfo.class"] = feeMapWithGivenId.class;
      } else {
        filter["academicInfo.class"] = classId;
      }
      if (dependencies.includes("hostel")) {
        filter["hostelInfo.hostel"] = feeMapWithGivenId.hostel;
        filter["otherInfo.hostelMember"] = true;
      }
      if (dependencies.includes("route") && feeMapWithGivenId.route) {
        filter["transportInfo.route"] = feeMapWithGivenId.route;
      }
      if (dependencies.includes("stop") && feeMapWithGivenId.stop) {
        filter["transportInfo.stop"] = feeMapWithGivenId.stop;
      }
      if (dependencies.includes("pickType") && feeMapWithGivenId.pickType) {
        filter["transportInfo.pickType"] = feeMapWithGivenId.pickType;
      }
      if (sectionId) {
        filter["academicInfo.section"] = sectionId;
      }

      const students = await studentQuery.findAll(filter);

      let finalListOfStudents = [];
      if (
        dependencies.includes("classNew") ||
        dependencies.includes("classOld")
      ) {
        const admissionNumbers = students.map(
          (student) => student.academicInfo.admissionNumber
        );
        const admissionCounts = await Student.aggregate([
          {
            $match: {
              "academicInfo.admissionNumber": { $in: admissionNumbers },
            },
          },
          {
            $group: {
              _id: "$academicInfo.admissionNumber",
              count: { $sum: 1 },
            },
          },
        ]);

        const countMap = admissionCounts.reduce((acc, cur) => {
          acc[cur._id] = cur.count;
          return acc;
        }, {});

        finalListOfStudents = students.filter((student) => {
          const count = countMap[student.academicInfo.admissionNumber] || 0;
          if (dependencies.includes("classNew")) {
            return count === 1;
          }
          if (dependencies.includes("classOld")) {
            return count > 1;
          }
        });
      } else {
        finalListOfStudents = students;
      }

      let totalFeeToBePaid = feeMapWithGivenId.fee;

      let results = [];

      for (let student of finalListOfStudents) {
        let allReceiptsPaid = await receiptQuery.findAll({
          academicYear: academicYearId,
          "payeeDetails.id": student._id,
        });
        let totalAmountPaid = allReceiptsPaid.reduce(
          (t, c) => t + parseFloat(c.amountPaid),
          0
        );
        let totalConcession = allReceiptsPaid.reduce(
          (t, c) => t + parseFloat(c.concessionDetails?.amount || 0),
          0
        );
        let totalPenalty = allReceiptsPaid.reduce(
          (t, c) => t + parseFloat(c.penalty || 0),
          0
        );
        let totalMiscellaneous = allReceiptsPaid.reduce(
          (t, c) => t + parseFloat(c.miscellaneous || 0),
          0
        );

        let amountPaidToWardsFee = 0;
        allReceiptsPaid.forEach((r) => {
          amountPaidToWardsFee += r.feeParticulars.reduce(
            (t, c) => t + parseFloat(c.amount || 0),
            0
          );
        });

        let newItem = {
          studentId: student._id.toHexString(),
          receiptTitle: feeMapWithGivenId.receiptTitle.name,
          rollNo: student.academicInfo?.rollNumber,
          class: student.academicInfo?.class?.name,
          section: student.academicInfo?.section?.name,
          name: student.basicInfo?.name,
          fatherName: student.fatherInfo?.name,
          phone: student.contactNumber,
          paid: totalAmountPaid,
          concession: totalConcession,
          miscellaneous: totalMiscellaneous,
          fine: totalPenalty,
          amount: totalFeeToBePaid,
          balance: totalFeeToBePaid - amountPaidToWardsFee,
        };
        results.push(newItem);
      }

      return common.successResponse({
        result: results.sort((a, b) => a.rollNo < b.rollNo),
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  // done
  static async downloadBalanceFeeReport(req) {
    try {
      const { academicYearId, feeMapId, classId, sectionId } = req.query;
      const feeMapFilter = {
        active: true,
        school: req.schoolId,
      };

      if (feeMapId) {
        feeMapFilter._id = feeMapId;
      }

      const feeMapWithGivenId = await feeMapQuery.findOne(feeMapFilter);
      if (!feeMapWithGivenId) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Fee map with the given id was not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const filter = {
        active: true,
        academicYear: (await academicYearQuery.findOne({ _id: academicYearId }))
          ._id,
      };

      if (!filter.academicYear) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active academic year not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const dependencies = feeMapWithGivenId.extendedDependencies;
      if (
        dependencies.includes("class") ||
        dependencies.includes("classOld") ||
        dependencies.includes("classNew")
      ) {
        filter["academicInfo.class"] = feeMapWithGivenId.class;
      } else {
        filter["academicInfo.class"] = classId;
      }
      if (dependencies.includes("hostel")) {
        filter["hostelInfo.hostel"] = feeMapWithGivenId.hostel;
        filter["otherInfo.hostelMember"] = true;
      }
      if (dependencies.includes("route") && feeMapWithGivenId.route) {
        filter["transportInfo.route"] = feeMapWithGivenId.route;
      }
      if (dependencies.includes("stop") && feeMapWithGivenId.stop) {
        filter["transportInfo.stop"] = feeMapWithGivenId.stop;
      }
      if (dependencies.includes("pickType") && feeMapWithGivenId.pickType) {
        filter["transportInfo.pickType"] = feeMapWithGivenId.pickType;
      }
      if (sectionId) {
        filter["academicInfo.section"] = sectionId;
      }

      const students = await studentQuery.findAll(filter);

      let finalListOfStudents = [];
      if (
        dependencies.includes("classNew") ||
        dependencies.includes("classOld")
      ) {
        const admissionNumbers = students.map(
          (student) => student.academicInfo.admissionNumber
        );
        const admissionCounts = await Student.aggregate([
          {
            $match: {
              "academicInfo.admissionNumber": { $in: admissionNumbers },
            },
          },
          {
            $group: {
              _id: "$academicInfo.admissionNumber",
              count: { $sum: 1 },
            },
          },
        ]);

        const countMap = admissionCounts.reduce((acc, cur) => {
          acc[cur._id] = cur.count;
          return acc;
        }, {});

        finalListOfStudents = students.filter((student) => {
          const count = countMap[student.academicInfo.admissionNumber] || 0;
          if (dependencies.includes("classNew")) {
            return count === 1;
          }
          if (dependencies.includes("classOld")) {
            return count > 1;
          }
        });
      } else {
        finalListOfStudents = students;
      }

      let totalFeeToBePaid = feeMapWithGivenId.fee;

      let results = [];

      for (let student of finalListOfStudents) {
        let allReceiptsPaid = await receiptQuery.findAll({
          academicYear: academicYearId,
          "payeeDetails.id": student._id,
        });
        let totalAmountPaid = allReceiptsPaid.reduce(
          (t, c) => t + parseFloat(c.amountPaid),
          0
        );
        let totalConcession = allReceiptsPaid.reduce(
          (t, c) => t + parseFloat(c.concessionDetails?.amount || 0),
          0
        );
        let totalPenalty = allReceiptsPaid.reduce(
          (t, c) => t + parseFloat(c.penalty || 0),
          0
        );
        let totalMiscellaneous = allReceiptsPaid.reduce(
          (t, c) => t + parseFloat(c.miscellaneous || 0),
          0
        );

        let amountPaidToWardsFee = 0;
        allReceiptsPaid.forEach((r) => {
          amountPaidToWardsFee += r.feeParticulars.reduce(
            (t, c) => t + parseFloat(c.amount || 0),
            0
          );
        });

        let newItem = {
          studentId: student._id.toHexString(),
          receiptTitle: feeMapWithGivenId.receiptTitle.name,
          name: student.basicInfo?.name,
          rollNo: student.academicInfo?.rollNumber,
          class: student.academicInfo?.class?.name,
          section: student.academicInfo?.section?.name,
          fatherName: student.fatherInfo?.name,
          phone: student.contactNumber,
          amount: totalFeeToBePaid,
          concession: totalConcession,
          fine: totalPenalty,
          miscellaneous: totalMiscellaneous,
          paid: totalAmountPaid,
          balance: totalFeeToBePaid - amountPaidToWardsFee,
        };
        results.push(newItem);
      }

      const workBook = new ExcelJS.Workbook();

      let sheet = workBook.addWorksheet("Balance Fee Report");

      let row1 = [
        "S.No",
        "Receipt",
        "Student",
        "Roll No",
        "Class",
        "Section",
        "Father Name",
        "Phone",
        "Amount",
        "Concession",
        "Fine",
        "Miscellaneous",
        "Paid",
        "Balance",
      ];

      sheet.addRow(row1);

      let result = results.sort((a, b) => a.rollNo < b.rollNo);

      for (let res of result) {
        let newRow = [result.indexOf(res) + 1];
        for (let key of Object.keys(res)) {
          if (key != "studentId") {
            newRow = [
              ...newRow,
              typeof res[key] === "undefined" ? "NA" : res[key],
            ];
          }
        }

        console.log(newRow, "new row");

        sheet.addRow(newRow);
      }

      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          // Apply horizontal and vertical alignment to center the content
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });
      });
      // // Get the first row
      const firstRow = sheet.getRow(1);

      // // Iterate through each cell in the first row and apply bold styling
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

      const response = await workBook.xlsx.writeBuffer({ filename: filePath });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: response,
        meta: {
          "Content-Disposition": "attachment; filename=Balance_Fee_Report.xlsx",
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAllReceipts(req) {
    const {
      academicYearId,
      cashierId,
      receiptTitleId,
      feeMapId,
      fromDate,
      toDate,
      sectionId,
      classId,
    } = req.query;

    const filter = {
      "payeeDetails.academicYearId": new mongoose.Types.ObjectId(
        academicYearId
      ),
      school: new mongoose.Types.ObjectId(req.schoolId),
    };
    if (cashierId !== "all") {
      filter["collectedBy"] = new mongoose.Types.ObjectId(cashierId);
    }
    if (receiptTitleId !== "all") {
      filter["receiptTitle.id"] = new mongoose.Types.ObjectId(receiptTitleId);
    }

    if (feeMapId !== "all") {
      filter["feeMap"] = new mongoose.Types.ObjectId(feeMapId);
    }

    if (classId !== "all") {
      filter["payeeDetails.classId"] = mongoose.Types.ObjectId(classId);
    }

    if (sectionId !== "all") {
      filter["payeeDetails.sectionId"] = new mongoose.Types.ObjectId(sectionId);
    }

    if (fromDate && toDate) {
      const { startOfDay, endOfDay } = getDateRange(fromDate, toDate);

      filter["paidAt"] = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    try {
      const receipts = await receiptQuery.findAll({
        ...filter,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: receipts,
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadReceipt(req) {
    try {
      const receipt = await receiptQuery.findOne({
        _id: req.params.id,
      });

      let feeMap = receipt.feeMap;
      let installmentPaid = receipt.installmentPaid;

      let installmentIndex = 0;

      for (let i = 0; i < feeMap.installments.length; i++) {
        if (
          feeMap.installments[i]._id.toHexString() ===
          installmentPaid.toHexString()
        ) {
          installmentIndex = i + 1;
          break;
        }
      }

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

      const content = await compileTemplate("feeReceipt", {
        ...receipt,
        paidAt: moment(receipt.paidAt).toDate().toLocaleDateString(),
        installMentPriority: installmentIndex,
      });

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",

        landscape: true,
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

  static async downloadReceiptStaff(req) {
    try {
      const receipt = await receiptQuery.findOne({
        _id: req.params.id,
      });

      let feeMap = receipt.feeMap;
      let installmentPaid = receipt.installmentPaid;

      let installmentIndex = 0;

      for (let i = 0; i < feeMap.installments.length; i++) {
        if (
          feeMap.installments[i]._id.toHexString() ===
          installmentPaid.toHexString()
        ) {
          installmentIndex = i + 1;
          break;
        }
      }

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

      const content = await compileTemplate("feeReceiptStaffNew", {
        ...receipt,
        paidAt: moment(receipt.paidAt).toDate().toLocaleDateString(),
        installMentPriority: installmentIndex,
      });

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
        landscape: true,
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

  // net to modify
  static async downloadFeeOverview(req) {
    const {
      academicYearId,
      cashierId,
      receiptTitleId,
      feeMapId,
      fromDate,
      toDate,
      sectionId,
      classId,
    } = req.query;

    const { startOfDay, endOfDay } = getDateRange(fromDate, toDate);

    try {
      const filter = {
        "payeeDetails.academicYearId": new mongoose.Types.ObjectId(
          academicYearId
        ),
        school: new mongoose.Types.ObjectId(req.schoolId),
      };
      if (cashierId !== "all") {
        filter["collectedBy"] = new mongoose.Types.ObjectId(cashierId);
      }
      if (receiptTitleId !== "all") {
        filter["receiptTitle.id"] = new mongoose.Types.ObjectId(receiptTitleId);
      }

      if (feeMapId !== "all") {
        filter["feeMap"] = new mongoose.Types.ObjectId(feeMapId);
      }

      if (classId !== "all") {
        filter["payeeDetails.classId"] = mongoose.Types.ObjectId(classId);
      }

      if (sectionId !== "all") {
        filter["payeeDetails.sectionId"] = new mongoose.Types.ObjectId(
          sectionId
        );
      }

      if (fromDate && toDate) {
        const { startOfDay, endOfDay } = getDateRange(fromDate, toDate);

        filter["paidAt"] = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }

      const receipts = await receiptQuery.findAll({
        ...filter,
      });

      // let inDifferem

      // for()

      const workbook = xlsx.utils.book_new();

      const worksheetData = receipts.map((receipt) => [
        receipt.receiptTitle.name,
        receipt.receiptNumber,
        receipt.paidAt,
        receipt.amountPaid,
        receipt.paymentMode,
        receipt.payeeDetails.name,
        receipt.payeeDetails.className,
        receipt.payeeDetails.sectionName,
        receipt.payeeDetails.admissionNumber,
      ]);

      const worksheet = xlsx.utils.aoa_to_sheet([
        [
          "Receipt Name",
          "Receipt Number",
          "Paid Date",
          "Amount",
          "Payment Mode",
          "Name",
          "Class",
          "Section",
          "Admission No",
        ],
        ...worksheetData,
      ]);

      xlsx.utils.book_append_sheet(workbook, worksheet, "Fee-Overview");

      const excelBuffer = xlsx.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      // Set response headers to trigger download

      common.successResponse({
        statusCode: httpStatusCode.ok,
        result: excelBuffer,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getMyReceipts(req) {
    try {
      const student = req.student;
      let allReceipts = await receiptQuery.findAll({
        "payeeDetails.id": student._id,
      });
      let allReceiptIds = allReceipts.map((r) => r._id);
      let allPastDues = await pastDuesQuery.findAll({
        receipt: { $in: allReceiptIds },
      });
      return common.successResponse({
        result: {
          receipts: allReceipts,
          pastDues: allPastDues,
        },
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }
};
