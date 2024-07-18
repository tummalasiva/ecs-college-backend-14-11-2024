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

const generateReceiptNumber = async (schoolId) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  let baseCount = 1000;

  let currentReceiptCount = await Receipt.count({
    school: schoolId,
  });
  baseCount = baseCount + currentReceiptCount;

  return `${year}${month}${day}${baseCount}`;
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

      console.log(feeMapFilter, "feemap fiilter");

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

      let pastDueForCurrentAcademicYear = await pastDuesQuery.findAll({
        feeMap: feeMapId,
        cleared: false,
        academicYear: currentAcademicYear._id,
        payeeAdmissionNumber: student.academicInfo.admissionNumber,
      });

      let pastDueForPreviousAcademicYears = await pastDuesQuery.findAll({
        feeMap: feeMapId,
        cleared: false,
        academicYear: { $ne: currentAcademicYear._id },
        payeeAdmissionNumber: student.academicInfo.admissionNumber,
      });

      let pastDues = [
        ...pastDueForPreviousAcademicYears,
        ...pastDueForCurrentAcademicYear,
      ];

      let feeMapCategories = await feeMapCategoryQuery.findAll({
        feeMap: feeMapId,
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
        previousAmountPaid += receipt.items.reduce(
          (total, current) =>
            ["Penalty", "Miscellaneous", "Past Due", "Concession"].includes(
              current.name
            )
              ? total
              : total + current.amount,
          0
        );

        previousAmountPaid += receipt.partialPaymentCompleted
          ? receipt.partialAmount
          : 0;
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

      let currentDue = feeMapWithGivenIdAndReceiptTitleId.installments.filter(
        (i) => i._id.toHexString() == installmentToBePaid
      )[0]?.amount;

      feeMapCategories = feeMapCategories.map((f) => ({
        ...f,
        amount: parseFloat(
          (
            (f.amount / feeMapWithGivenIdAndReceiptTitleId.fee) *
            Number(currentDue)
          ).toFixed(2)
        ),
        amountPaid: parseFloat(
          (
            (f.amount / feeMapWithGivenIdAndReceiptTitleId.fee) *
            Number(currentDue)
          ).toFixed(2)
        ),
      }));

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: {
          pastDues,
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

  static async collectFees(req) {
    try {
      let {
        feeMapId,
        studentId,
        installmentId,
        items,
        pastDueIds,
        paymentMode,
        ddDetails,
        upiDetails,
        cashDetails,
        cardDetails,
        chequeDetails,
        netBankingDetails,
        concessionDetails,
      } = req.body;
      let schoolId = req.schoolId;

      // past due format ;

      // {
      //   feeMapCategory: ObjectId,
      //   actualAmount: Number,
      //   payingAmount: Number,
      //   paidAmount: Number,
      // }

      const school = await schoolQuery.findOne({ _id: schoolId });

      if (!school)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "School not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(items))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid items provided",
          responseCode: "CLIENT_ERROR",
        });
      if (!Array.isArray(pastDueIds))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid pastDue ids provided",
          responseCode: "CLIENT_ERROR",
        });

      if (!paymentMode)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid payment mode provided",
          responseCode: "CLIENT_ERROR",
        });

      if (paymentMode === "Upi") {
        if (!upiDetails.utrNo || !upiDetails.upiApp)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Invalid Upi details provided",
            responseCode: "CLIENT_ERROR",
          });
      }

      let feeMapWithTheGivenId = await feeMapQuery.findOne({
        _id: feeMapId,
        school: schoolId,
      });

      if (!feeMapWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Fee map with the given id was not found!",
          responseCode: "CLIENT_ERROR",
        });

      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active Academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      const receiptTitle = {
        id: feeMapWithTheGivenId.receiptTitle._id,
        name: feeMapWithTheGivenId.receiptTitle.name,
        academicYearFrom: currentAcademicYear.academicYearFrom,
        academicYearTo: currentAcademicYear.academicYearTo,
      };

      const schoolDetails = school._id;
      const student = await studentQuery.findOne({ _id: studentId });

      let payeeDetails = {
        id: student._id,
        name: student.basicInfo?.name,
        contactNumber: student.contactNumber,
        academicYearId: currentAcademicYear._id,
        sectionId: student.academicInfo?.section?._id,
        classId: student.academicInfo?.class?._id,
        admissionNumber: student.academicInfo?.admissionNumber,
        rollNumber: student.academicInfo?.rollNumber,
        className: student.academicInfo.class?.name,
        parentName: student.fatherInfo?.name,
        sectionName: student.academicInfo?.section?.name,
      };

      let receiptWithThisInstallmentPaid = await receiptQuery.findOne({
        "payeeDetails.id": studentId,
        installmentPaid: installmentId,
      });
      if (receiptWithThisInstallmentPaid && !pastDueIds.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "This installment has already been paid!",
          responseCode: "CLIENT_ERROR",
        });

      let previousReceipts = await receiptQuery.findAll({
        feeMap: feeMapId,
        "payeeDetails.id": studentId,
        "payeeDetails.academicYearId": currentAcademicYear._id,
      });

      let pastDues = await pastDuesQuery.findAll({
        feeMap: feeMapId,
        payee: studentId,
        cleared: false,
        academicYear: currentAcademicYear._id,
      });

      if (
        feeMapWithTheGivenId.installments.length - previousReceipts.length ==
          1 &&
        pastDues.length !== pastDueIds.length
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please add past due amount to proceed!",
          responseCode: "CLIENT_ERROR",
        });
      }

      let installmentToBePaid = feeMapWithTheGivenId.installments.filter(
        (i) => i._id.toHexString() == installmentId
      )[0];
      if (!installmentToBePaid)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Installment to be paid was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let totalFeeToBePaid = feeMapWithTheGivenId.fee.toFixed(2);
      let basicAmountToBePaid = installmentToBePaid.amount.toFixed(2);

      let totalAmountBeingPaidWithoutConcession = items.reduce(
        (total, current) => total + Number(current.amount),
        0
      );

      items = items.map((i) => ({
        ...i,
        description: i.description || i.name,
      }));

      let amountPaidAsPenalty = items.reduce(
        (total, current) =>
          current.name === "Penalty" ? total + Number(current.amount) : total,
        0
      );
      let totalAmountPaidInMiscellaneous = items.reduce(
        (total, current) =>
          current.name === "Miscellaneous"
            ? total + Number(current.amount)
            : total,
        0
      );

      let basicPaymentBeingDone =
        totalAmountBeingPaidWithoutConcession -
        (amountPaidAsPenalty + totalAmountPaidInMiscellaneous);

      if (basicPaymentBeingDone > basicAmountToBePaid)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Amount being paid is more than installment amount!",
          responseCode: "CLIENT_ERROR",
        });

      let isPartialyPaid = false;
      let partialDue = 0;

      if (basicPaymentBeingDone < basicAmountToBePaid) {
        isPartialyPaid = true;
        partialDue = basicAmountToBePaid - basicPaymentBeingDone;
      }

      let pastDueAmounts = 0;
      let allReceiptsWithPartialDue = [];
      if (pastDueIds.length) {
        let pastFeeDues = await pastDuesQuery.findAll({
          _id: { $in: pastDueIds },
        });
        allReceiptsWithPartialDue = pastFeeDues.map((d) => d.receipt);
        pastDueAmounts = pastFeeDues.reduce(
          (total, current) => total + current.amount,
          0
        );
      }

      // get the amount being paid as concession fee;
      let { amount, referredBy, givenAs } = concessionDetails;
      if (givenAs === "Percentage" && amount > 100)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Concession percentage cannot be more that 100%",
          responseCode: "CLIENT_ERROR",
        });
      let modifiedConcessionObject = {};
      let amountToBeReducedAsConcession = 0;
      if (Object.keys(concessionDetails).length) {
        modifiedConcessionObject.amount =
          givenAs === "Percentage"
            ? Number(amount) * 0.01 * basicPaymentBeingDone
            : Number(amount);
        modifiedConcessionObject.referredBy = referredBy;
        modifiedConcessionObject.givenAs = givenAs;
        amountToBeReducedAsConcession =
          modifiedConcessionObject.amount.toFixed(2);
      }

      let totalAmountBeingPaid =
        pastDueAmounts +
        totalAmountBeingPaidWithoutConcession -
        amountToBeReducedAsConcession;

      let allItems = [
        ...items.map((i) => ({ ...i, amount: Number(i.amount).toFixed(2) })),
      ];
      if (pastDueAmounts) {
        let newItem = {
          name: "Past Due",
          description: "Past Due",
          amount: pastDueAmounts.toFixed(2),
        };

        allItems.push(newItem);
      }

      if (amountToBeReducedAsConcession) {
        let newItem = {
          name: "Concession",
          description: "Concession",
          amount: Number(amountToBeReducedAsConcession).toFixed(2),
        };
        allItems.push(newItem);
      }

      let newReceipt = await receiptQuery.create({
        amountPaid: totalAmountBeingPaid.toFixed(2),
        collectedBy: req.employee._id,
        feeMap: feeMapId,
        installmentPaid: installmentId,
        items: allItems,
        paidAt: Date.now(),
        schoolDetails,
        school: req.schoolId,
        cardDetails,
        cashDetails,
        chequeDetails,
        concessionDetails: modifiedConcessionObject,
        ddDetails,
        netBankingDetails,
        payeeDetails,
        paymentMode,
        receiptTitle,
        upiDetails,
        partialAmount: isPartialyPaid ? partialDue.toFixed(2) : 0,
        partialPaymentCompleted: false,
        partiallyPaid: isPartialyPaid,
        receiptNumber: await generateReceiptNumber(req.schoolId),
      });

      if (pastDueIds) {
        let updated = await pastDuesQuery.updateMany(
          { receipt: { $in: allReceiptsWithPartialDue } },
          {
            $set: {
              collectedBy: req.employee._id,
              cleared: true,
              paidAt: Date.now(),
            },
          }
        );

        await receiptQuery.updateMany(
          { _id: { $in: allReceiptsWithPartialDue } },
          { $set: { partialPaymentCompleted: true } }
        );
      }

      if (newReceipt.partiallyPaid === true) {
        await pastDuesQuery.create({
          academicYear: currentAcademicYear._id,
          amount: partialDue,
          feeMap: feeMapId,
          installmentId: installmentId,
          payeeType: "student",
          payee: studentId,
          receipt: newReceipt._id,
        });
      }

      let installmentIndex = 0;

      for (let i = 0; i < feeMapWithTheGivenId.installments.length; i++) {
        if (
          feeMapWithTheGivenId.installments[i]._id.toHexString() ===
          installmentId
        ) {
          installmentIndex = i + 1;
          break;
        }
      }

      let leanReceiptObject = await receiptQuery.findOne({
        _id: newReceipt._id,
      });

      leanReceiptObject = {
        ...leanReceiptObject,
        installMentPriority: installmentIndex,
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

      const content = await compileTemplate("feeReceipt", {
        ...leanReceiptObject,
        paidAt: moment(newReceipt.paidAt).toDate().toLocaleDateString(),
        school: {
          ...leanReceiptObject.schoolDetails,
        },
      });

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
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

  static async previewReceipt(req) {
    try {
      let {
        feeMapId,
        studentId,
        installmentId,
        feeParticulars,
        items,
        pastDueIds,
        paymentMode,
        ddDetails,
        upiDetails,
        cashDetails,
        cardDetails,
        chequeDetails,
        netBankingDetails,
        concessionDetails,
      } = req.body;
      let schoolId = req.schoolId;

      if (!Array.isArray(items))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid items provided",
          responseCode: "CLIENT_ERROR",
        });
      if (!Array.isArray(pastDueIds))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid pastDue ids provided",
          responseCode: "CLIENT_ERROR",
        });

      if (!paymentMode)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid payment mode provided",
          responseCode: "CLIENT_ERROR",
        });

      if (paymentMode === "Upi") {
        if (!upiDetails.upiApp || !upiDetails.utrNo)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Invalid UPI details provided",
            responseCode: "CLIENT_ERROR",
          });
      }

      let feeMapWithTheGivenId = await feeMapQuery.findOne({
        _id: feeMapId,
        school: schoolId,
      });

      if (!feeMapWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid fee map id provided",
          responseCode: "CLIENT_ERROR",
        });

      const school = await schoolQuery.findOne({ _id: req.schoolId });

      if (!school)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "School not found",
          responseCode: "CLIENT_ERROR",
        });

      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found",
          responseCode: "CLIENT_ERROR",
        });

      const receiptTitle = {
        id: feeMapWithTheGivenId.receiptTitle._id,
        name: feeMapWithTheGivenId.receiptTitle.name,
        academicYearFrom: currentAcademicYear.academicYearFrom,
        academicYearTo: currentAcademicYear.academicYearTo,
      };

      const schoolDetails = school._id;
      const student = await studentQuery.findOne({ _id: studentId });

      let payeeDetails = {
        id: student._id,
        name: student.basicInfo.name,
        contactNumber: student.contactNumber,
        academicYearId: currentAcademicYear._id,
        sectionId: student.academicInfo?.section?._id,
        classId: student.academicInfo?.class?._id,
        admissionNumber: student.academicInfo?.admissionNumber,
        rollNumber: student.academicInfo?.rollNumber,
        className: student.academicInfo?.class?.name,
        parentName: student.fatherInfo.name,
        sectionName: student.academicInfo?.section?.name,
      };

      let receiptWithThisInstallmentPaid = await receiptQuery.findOne({
        "payeeDetails.id": studentId,
        installmentPaid: installmentId,
      });

      if (receiptWithThisInstallmentPaid)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "This installment has already been paid",
          responseCode: "CLIENT_ERROR",
        });

      let installmentToBePaid = feeMapWithTheGivenId.installments.filter(
        (i) => i._id.toHexString() == installmentId
      )[0];
      if (!installmentToBePaid)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Installment to be paid was not found",
          responseCode: "CLIENT_ERROR",
        });

      let totalFeeToBePaid = feeMapWithTheGivenId.fee;
      let basicAmountToBePaid = installmentToBePaid.amount;

      let totalAmountBeingPaidWithoutConcession = items.reduce(
        (total, current) => total + Number(current.amount),
        0
      );

      items = items.map((i) => ({
        ...i,
        description: i.description || i.name,
      }));

      let amountPaidAsPenalty = items.reduce(
        (total, current) =>
          current.name === "Penalty" ? total + Number(current.amount) : total,
        0
      );
      let totalAmountPaidInMiscellaneous = items.reduce(
        (total, current) =>
          current.name === "Miscellaneous"
            ? total + Number(current.amount)
            : total,
        0
      );

      let basicPaymentBeingDone =
        totalAmountBeingPaidWithoutConcession -
        (amountPaidAsPenalty + totalAmountPaidInMiscellaneous);

      if (basicPaymentBeingDone > basicAmountToBePaid)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Amount being paid is more than installment amount!",
          responseCode: "CLIENT_ERROR",
        });

      let isPartialyPaid = false;
      let partialDue = 0;

      if (basicPaymentBeingDone < basicAmountToBePaid) {
        isPartialyPaid = true;
        partialDue = basicAmountToBePaid - basicPaymentBeingDone;
      }

      let pastDueAmounts = 0;
      if (pastDueIds.length) {
        let pastFeeDues = await pastDuesQuery.findAll({
          _id: { $in: pastDueIds },
        });
        pastDueAmounts = pastFeeDues.reduce(
          (total, current) => total + Number(current.amount),
          0
        );
      }

      // get the amount being paid as concession fee;
      let { amount, referredBy, givenAs } = concessionDetails;
      if (givenAs === "Percentage" && amount > 100)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Concession percentage cannot be more that 100%",
          responseCode: "CLIENT_ERROR",
        });
      let modifiedConcessionObject = {};
      let amountToBeReducedAsConcession = 0;
      if (Object.keys(concessionDetails).length) {
        modifiedConcessionObject.amount =
          givenAs === "Percentage"
            ? Number(amount) * 0.01 * basicPaymentBeingDone
            : Number(amount);
        modifiedConcessionObject.referredBy = referredBy;
        modifiedConcessionObject.givenAs = givenAs;
        amountToBeReducedAsConcession =
          modifiedConcessionObject.amount.toFixed(2);
      }

      let totalAmountBeingPaid =
        pastDueAmounts +
        totalAmountBeingPaidWithoutConcession -
        amountToBeReducedAsConcession;

      let allItems = [
        ...items.map((i) => ({ ...i, amount: Number(i.amount).toFixed(2) })),
      ];
      if (pastDueAmounts) {
        let newItem = {
          name: "Past Due",
          description: "Past Due",
          amount: pastDueAmounts.toFixed(2),
        };

        allItems.push(newItem);
      }

      if (amountToBeReducedAsConcession) {
        let newItem = {
          name: "Concession",
          description: "Concession",
          amount: amountToBeReducedAsConcession,
        };
        allItems.push(newItem);
      }

      let newReceipt = {
        amountPaid: totalAmountBeingPaid.toFixed(2),
        collectedBy: req.employee._id,
        feeMap: feeMapId,
        installmentPaid: installmentId,
        items: allItems,
        paidAt: Date.now(),
        schoolDetails,
        school: req.schoolId,
        cardDetails,
        cashDetails,
        chequeDetails,
        concessionDetails: modifiedConcessionObject,
        ddDetails,
        netBankingDetails,
        payeeDetails,
        paymentMode,
        receiptTitle,
        upiDetails,
        partialAmount: isPartialyPaid ? partialDue.toFixed(2) : 0,
        partialPaymentCompleted: false,
        partiallyPaid: isPartialyPaid,
        receiptNumber: await generateReceiptNumber(req.schoolId),
        amountPaidInWords: amountInWords(totalAmountBeingPaid),
      };

      let installmentIndex = 0;

      for (let i = 0; i < feeMapWithTheGivenId.installments.length; i++) {
        if (
          feeMapWithTheGivenId.installments[i]._id.toHexString() ===
          installmentId
        ) {
          installmentIndex = i + 1;
          break;
        }
      }

      newReceipt = {
        ...newReceipt,
        installMentPriority: installmentIndex,
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
        paidAt: moment(new Date()).toDate().toLocaleDateString(),
        school,
      });

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
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

  static async updateSingleReceiptReconciliationStatusStatus(req) {
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

  static async updateMultipleReceiptReconciliationStatusStatus(req) {
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
      const { startOfDay, endOfDay } = getDateRange(fromDate, toDate);
      let filter = {
        "receiptTitle.id": mongoose.Types.ObjectId(receiptTitleId),
        feeMap: mongoose.Types.ObjectId(feeMapId),
        "payeeDetails.classId": mongoose.Types.ObjectId(classId),
        "payeeDetails.academicYearId": mongoose.Types.ObjectId(academicYearId),

        paidAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        collectedBy: mongoose.Types.ObjectId(cashierId),
      };

      if (sectionId !== "all") {
        filter["payeeDetails.sectionId"] = mongoose.Types.ObjectId(sectionId);
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

  static async getBalanceFeeReport(req) {
    try {
      const { academicYearId, feeMapId, search = {} } = req.query;

      let academicYearWithTheGivenId = await academicYearQuery.findOne({
        _id: academicYearId,
      });
      if (!academicYearWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      let feeMapWithTheGivenId = await feeMapQuery.findOne({
        _id: feeMapId,
      });

      if (!feeMapWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Fee map not found!",
          responseCode: "CLIENT_ERROR",
        });

      let result = [];
      let allReceipts = await receiptQuery.findAll({
        ...search,
        "payeeDetails.academicYearId": academicYearId,

        feeMap: feeMapId,
      });

      for (let receipt of allReceipts) {
        if (
          result.filter(
            (r) => r.studentId == receipt.payeeDetails.id.toHexString()
          )[0]
        ) {
          result = [
            ...result.map((r) =>
              r.studentId == receipt.payeeDetails.id.toHexString()
                ? {
                    ...r,
                    paid: r.paid + receipt.amountPaid,
                    concession: r.concession + receipt.concessionDetails.amount,
                    fine:
                      r.fine +
                      receipt.items.reduce(
                        (total, current) =>
                          !["Penalty"].includes(current.name)
                            ? total
                            : total + current.amount,
                        0
                      ),
                    balance:
                      r.balance -
                      receipt.items.reduce(
                        (total, current) =>
                          ["Miscellaneous", "Penalty", "Concession"].includes(
                            current.name
                          )
                            ? total
                            : total + current.amount,
                        0
                      ),
                  }
                : r
            ),
          ];
        } else {
          let newItem = {
            studentId: receipt.payeeDetails.id.toHexString(),
            receiptTitle: receipt.receiptTitle.name,
            rollNo: receipt.payeeDetails.rollNumber,
            class: receipt.payeeDetails.className,
            section: receipt.payeeDetails.sectionName,
            name: receipt.payeeDetails.name,
            fatherName: receipt.payeeDetails.parentName,
            phone: receipt.payeeDetails.contactNumber,
            paid: receipt.amountPaid,
            concession: receipt.concessionDetails.amount,
            fine: receipt.items.reduce(
              (total, current) =>
                !["Penalty"].includes(current.name)
                  ? total
                  : total + current.amount,
              0
            ),
            amount: feeMapWithTheGivenId.fee,
            balance:
              feeMapWithTheGivenId.fee -
              receipt.items.reduce(
                (total, current) =>
                  ["Miscellaneous", "Concession", "Penalty"].includes(
                    current.name
                  )
                    ? total
                    : total + current.amount,
                0
              ),
          };

          result.push(newItem);
        }
      }

      return common.successResponse({
        result: result.filter((r) => parseInt(r.balance.toFixed(0)) >= 1),
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadBalanceFeeReport(req) {
    try {
      const { academicYearId, feeMapId, search = {} } = req.query;

      let academicYearWithTheGivenId = await academicYearQuery.findOne({
        _id: academicYearId,
      });
      if (!academicYearWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      let feeMapWithTheGivenId = await feeMapQuery.findOne({
        _id: feeMapId,
      });

      if (!feeMapWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Fee map not found!",
          responseCode: "CLIENT_ERROR",
        });

      let result = [];
      let allReceipts = await receiptQuery.findAll({
        ...search,
        "payeeDetails.academicYearId": academicYearId,
        feeMap: feeMapId,
      });

      for (let receipt of allReceipts) {
        if (
          result.filter(
            (r) => r.studentId == receipt.payeeDetails.id.toHexString()
          )[0]
        ) {
          result = [
            ...result.map((r) =>
              r.studentId == receipt.payeeDetails.id.toHexString()
                ? {
                    ...r,
                    concession:
                      r.concession +
                      Number(receipt.concessionDetails.amount.toFixed(2)),
                    fine:
                      r.fine +
                      Number(
                        receipt.items
                          .reduce(
                            (total, current) =>
                              !["Penalty"].includes(current.name)
                                ? total
                                : total + current.amount,
                            0
                          )
                          .toFixed(2)
                      ),

                    paid: r.paid + Number(receipt.amountPaid.toFixed(2)),

                    balance:
                      r.balance -
                      receipt.items
                        .reduce(
                          (total, current) =>
                            ["Miscellaneous", "Penalty", "Concession"].includes(
                              current.name
                            )
                              ? total
                              : total + current.amount,
                          0
                        )
                        .toFixed(2),
                  }
                : r
            ),
          ];
        } else {
          let newItem = {
            studentId: receipt.payeeDetails.id.toHexString(),
            receiptTitle: receipt.receiptTitle.name,
            name: receipt.payeeDetails.name,
            rollNo: receipt.payeeDetails.rollNumber,
            class: receipt.payeeDetails.className,
            section: receipt.payeeDetails.sectionName,
            fatherName: receipt.payeeDetails.parentName,
            phone: receipt.payeeDetails.contactNumber,
            amount: feeMapWithTheGivenId.fee.toFixed(2),
            concession: Number(receipt.concessionDetails.amount.toFixed(2)),
            fine: Number(
              receipt.items
                .reduce(
                  (total, current) =>
                    !["Penalty"].includes(current.name)
                      ? total
                      : total + current.amount,
                  0
                )
                .toFixed(2)
            ),

            paid: Number(receipt.amountPaid.toFixed(2)),

            balance:
              feeMapWithTheGivenId.fee -
              receipt.items
                .reduce(
                  (total, current) =>
                    ["Miscellaneous", "Concession", "Penalty"].includes(
                      current.name
                    )
                      ? total
                      : total + current.amount,
                  0
                )
                .toFixed(2),
          };

          result.push(newItem);
        }
      }

      const workBook = new ExcelJS.Workbook();

      result = result.filter((r) => parseInt(r.balance.toFixed(0)) >= 1);

      let sheet = workBook.addWorksheet("Balance Fee Report");

      let row1 = [
        "S.No",
        "Receipt",
        "Student",
        "Roll No",
        "Class",
        "Section",
        "Guardian",
        "Phone",
        "Amount",
        "Concession",
        "Fine",
        "Paid",
        "Balance",
      ];

      sheet.addRow(row1);

      for (let res of result) {
        let newRow = [result.indexOf(res) + 1];
        for (let key of Object.keys(res)) {
          if (key != "studentId") {
            newRow = [...newRow, res[key]];
          }
        }

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

      const fileName = `BalanceFeeReport.xlsx`;

      const filePath = path.join(__dirname, fileName);
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

    const { startOfDay, endOfDay } = getDateRange(fromDate, toDate);

    let filter = {
      "payeeDetails.academicYearId": academicYearId,
      collectedBy: cashierId,
      "receiptTitle.id": receiptTitleId,
      "payeeDetails.classId": classId,
      feeMap: feeMapId,
      paidAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    if (sectionId !== "all") {
      filter["payeeDetails.sectionId"] = sectionId;
    }

    try {
      const receipts = await receiptQuery.findAll({
        ...filter,
      });
      res.send({
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
      let filter = {
        "payeeDetails.academicYearId": academicYearId,
        collectedBy: cashierId,
        "receiptTitle.id": receiptTitleId,
        "payeeDetails.classId": classId,
        feeMap: feeMapId,
        paidAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      };

      if (sectionId !== "all") {
        filter["payeeDetails.sectionId"] = sectionId;
      }
      const receipts = await receiptQuery.findAll({
        ...filter,
      });

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

  static async getAllPastDues(req) {
    try {
      const { search = {} } = req.query;
      const allPastDues = await pastDuesQuery.findAll({
        ...search,
      });
      return common.successResponse({
        result: allPastDues,
        statusCode: httpStatusCode.ok,
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
