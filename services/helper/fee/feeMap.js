const receiptTitleQuery = require("@db/fee/receiptTitle/queries");
const feeMapQuery = require("@db/fee/feeMap/queries");
const feeMapCategoryQuery = require("@db/fee/feeMapCategory/queries");
const classQuery = require("@db/class/queries");
const routeQuery = require("@db/transport/route/queries");
const roomQuery = require("@db/room/queries");
const roomTypeQuery = require("@db/roomType/queries");
const hostelQuery = require("@db/hostel/queries");
const receiptQuery = require("@db/fee/receipt/queries");
const academicYearQuery = require("@db/academicYear/queries");
const stopQuery = require("@db/transport/stop/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const FeeMapCategory = require("../../../db/fee/feeMapCategory/model");

const VALID_DEPENDENCIES = [
  "class",
  "classOld",
  "classNew",
  "transport",
  "hostel",
  "stop",
  "route",
  "pickType",
];

const getExtentedDependencies = (dependencies) => {
  let allDependencies = [...dependencies];
  for (let dep of dependencies) {
    if (dep === "stop") {
      allDependencies = [...allDependencies, "route"];
    }
  }

  return [...new Set(allDependencies)];
};

module.exports = class FeeMapService {
  static async create(req) {
    try {
      const {
        receiptTitleId,
        dependencies,
        classId,
        routeId,
        pickType,
        stopId,
        hostelId,
        fee,
        installments,
        installmentType,
      } = req.body;

      let data = {};

      if (!Array.isArray(installments))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid installments provided",
          responseCode: "CLIENT_ERROR",
        });

      if (installments.length < 1)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "At least one installment should be provided",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(dependencies))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid dependencies provided",
          responseCode: "CLIENT_ERROR",
        });

      if (dependencies.length < 1)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please select at least one dependency to create fee map!",
          responseCode: "CLIENT_ERROR",
        });

      for (let dependency of dependencies) {
        if (!VALID_DEPENDENCIES.includes(dependency))
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Invalid dependency provided!",
            responseCode: "CLIENT_ERROR",
          });
      }

      let receiptTitleWithGivenId = await receiptTitleQuery.findOne({
        _id: receiptTitleId,
        school: req.schoolId,
      });

      if (!receiptTitleWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Receipt name with the given id was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let checkFilter = {};

      if (
        dependencies.includes("class") ||
        dependencies.includes("classOld") ||
        dependencies.includes("classNew")
      ) {
        if (!classId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention class!",
            responseCode: "CLIENT_ERROR",
          });
        checkFilter["class"] = classId;
      }

      if (dependencies.includes("hostel")) {
        if (!hostelId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention hostel!",
            responseCode: "CLIENT_ERROR",
          });
        checkFilter["hostel"] = hostelId;
      }

      if (dependencies.includes("transport")) {
        if (!routeId || !stopId || !pickType)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention route, stop and pickType!",
            responseCode: "CLIENT_ERROR",
          });

        checkFilter["route"] = routeId;
        checkFilter["pickType"] = pickType;
        checkFilter["stop"] = stopId;
      }

      let feeMapWithAboveDetailsExist = await feeMapQuery.findOne({
        school: req.schoolId,
        receiptTitle: receiptTitleId,
        dependencies: {
          $size: dependencies.length,
          $all: dependencies,
        },
        ...checkFilter,
      });

      if (feeMapWithAboveDetailsExist)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Fee map with given details already exists!",
          responseCode: "CLIENT_ERROR",
        });

      data["receiptTitle"] = receiptTitleId;
      data["dependencies"] = dependencies;
      data["extendedDependencies"] = getExtentedDependencies(dependencies);
      data["installmentType"] = installmentType;

      if (
        dependencies.includes("class") ||
        dependencies.includes("classOld") ||
        dependencies.includes("classNew")
      ) {
        let classWithTheGivenId = await classQuery.findOne({
          _id: classId,
          school: req.schoolId,
        });

        if (!classWithTheGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Class with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["class"] = classId;
      }

      if (dependencies.includes("transport")) {
        let routeWithGivenId = await routeQuery.findOne({
          _id: routeId,
        });

        if (!routeWithGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Route with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });

        data["route"] = routeId;
        let stopWithTheGivenId = await stopQuery.findOne({
          _id: stopId,
        });
        if (!stopWithTheGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Stop with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["stop"] = stopId;

        if (pickType) {
          data["pickType"] = pickType;
        }
      }

      if (dependencies.includes("hostel")) {
        let hostelWithGivenId = await hostelQuery.findOne({ _id: hostelId });
        if (!hostelWithGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Hostel with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["hostel"] = hostelId;
      }

      data["fee"] = fee;

      let totalInstallmentFee = installments.reduce(
        (total, current) => total + current.amount,
        0
      );

      if (fee !== totalInstallmentFee)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Total fee should be equal to sum of all the installments!",
          responseCode: "CLIENT_ERROR",
        });

      // here do the validation for installment due dates
      data["installments"] = installments;
      data["createdBy"] = req.employee._id;
      data["school"] = req.schoolId;

      let newFeeMap = await feeMapQuery.create(data);

      console.log(newFeeMap, " new fee map");

      await feeMapCategoryQuery.create({
        amount: newFeeMap.fee,
        description: "NA",
        feeMap: newFeeMap._id,
        name: "Standard Fee",
        priority: 1,
        school: req.schoolId,
      });

      return common.successResponse({
        result: newFeeMap,
        statusCode: httpStatusCode.ok,
        message: "Fee map created successfully!",
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

      let feeMaps = await feeMapQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: feeMaps,
        message: "Fee Maps fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const {
        receiptTitleId,
        installmentType,
        dependencies,
        classId,
        stopId,
        routeId,
        pickType,
        hostelId,
        fee,
        installments,
      } = req.body;

      const feeMapId = req.params.id;

      if (!Array.isArray(installments))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Installments should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(dependencies))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Dependencies should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      let feeMapWithGivenId = await feeMapQuery.findOne({
        _id: feeMapId,
      });

      if (!feeMapWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Fee map with the given id was not found!",
          responseCode: "CLIENT_ERROR",
        });

      const activeAcademicYear = await academicYearQuery.findOne({
        active: true,
      });

      if (!activeAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found!",
          responseCode: "CLIENT_ERROR",
        });

      // check if the given fee map has been used while creating any receipt
      let feeReceiptWithGivenFeeMap = await receiptQuery.findOne({
        feeMap: feeMapId,
        "payeeDetails.academicYearId": activeAcademicYear._id,
      });
      if (feeReceiptWithGivenFeeMap)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Fee map cannot be modified as it has been used while creating a fee receipt!",
          responseCode: "CLIENT_ERROR",
        });

      let data = {};

      let receiptTitleWithGivenId = await receiptTitleQuery.findOne({
        _id: receiptTitleId,
        school: req.schoolId,
      });
      if (!receiptTitleWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Receipt title with the given id was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let checkFilter = {};

      if (
        dependencies.includes("class") ||
        dependencies.includes("classOld") ||
        dependencies.includes("classNew")
      ) {
        checkFilter["class"] = classId;
      }
      if (dependencies.includes("hostel")) {
        checkFilter["hostel"] = hostelId;
      }
      if (dependencies.includes("transport")) {
        checkFilter["route"] = routeId;
        checkFilter["pickType"] = pickType;
        checkFilter["stop"] = stopId;
      }

      let feeMapWithAboveDetailsExist = await feeMapQuery.findOne({
        _id: { $ne: feeMapId },
        school: req.schoolId,
        receiptTitle: receiptTitleId,
        dependencies: { $all: dependencies, $size: dependencies.length },
        ...checkFilter,
      });

      if (feeMapWithAboveDetailsExist)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Fee map with the given details already exists!",
          responseCode: "CLIENT_ERROR",
        });

      data["receiptTitle"] = receiptTitleId;

      for (let dependency of dependencies) {
        if (!VALID_DEPENDENCIES.includes(dependency))
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Invalid dependency!",
            responseCode: "CLIENT_ERROR",
          });
      }

      data["dependencies"] = dependencies;
      data["extendedDependencies"] = getExtentedDependencies(dependencies);

      if (
        dependencies.includes("class") ||
        dependencies.includes("classOld") ||
        dependencies.includes("classNew")
      ) {
        let classWithTheGivenId = await classQuery.findOne({
          _id: classId,

          school: req.schoolId,
        });
        if (!classWithTheGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Class with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });

        data["class"] = classId;
      } else {
        data["class"] = null;
      }

      if (dependencies.includes("transport")) {
        let routeWithGivenId = await routeQuery.findOne({
          _id: routeId,
        });
        if (!routeWithGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Route with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });

        data["route"] = routeId;
        let stopWithTheGivenId = await stopQuery.findOne({
          _id: stopId,
        });
        if (!stopWithTheGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Stop with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["stop"] = stopId;
        data["pickType"] = pickType;
      } else {
        data["route"] = null;
        data["stop"] = null;
        data["pickType"] = null;
      }

      if (dependencies.includes("hostel")) {
        let hostelWithGivenId = await hostelQuery.findOne({ _id: hostelId });
        if (!hostelWithGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Hostel with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["hostel"] = hostelId;
      } else {
        data["hostel"] = null;
      }

      data["fee"] = fee;
      data["installmentType"] = installmentType;

      let totalInstallmentFee = installments.reduce(
        (total, current) => total + current.amount,
        0
      );

      if (fee !== totalInstallmentFee)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Total fee should be equal to sum of all the installments!",
          responseCode: "CLIENT_ERROR",
        });

      // here do the validation for installment due dates
      data["installments"] = installments.map((i) => {
        delete i.id;
        return i;
      });

      let feeMapCategories = await feeMapCategoryQuery.findAll({
        feeMap: feeMapId,
      });
      let totalFeeCategoryAmount = feeMapCategories.reduce(
        (total, current) => total + Number(current.amount),
        0
      );
      if (feeMapCategories.length && totalFeeCategoryAmount !== fee) {
        let multiplier = fee / totalFeeCategoryAmount;
        await FeeMapCategory.updateMany(
          { feeMap: feeMapId, deleted: false },
          { $mul: { amount: multiplier } }
        );
      }

      let updatedFeeMap = await feeMapQuery.updateOne(
        { _id: feeMapId },
        { $set: data },
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fee map updated successfully!",
        result: updatedFeeMap,
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleActiveStatus(req) {
    try {
      let feeMap = await feeMapQuery.updateOne(
        { _id: req.params.id },
        [{ $set: { active: { $eq: ["$active", false] } } }],
        {
          new: true,
        }
      );
      if (feeMap) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: feeMap.active
            ? "Fee Map activated successfully!"
            : "Fee Map deactivated successfully!",
          result: feeMap,
        });
      } else {
        return common.failureResponse({
          message: "Fee Map not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      let feeMap = await feeMapQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fee Map deleted successfully!",
        result: feeMap,
      });
    } catch (error) {
      throw error;
    }
  }
};
