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

const VALID_DEPENDENCIES = [
  "class",
  "room",
  "academicYear",
  "route",
  "stop",
  "addedBefore",
  "addedAfter",
  "libraryMember",
  "transportMember",
  "hostelMember",
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
        collectedFrom,
        dependencies,
        classId,
        routeId,
        roomId,
        academicYearId,
        addedAfter,
        addedBefore,
        stopId,
        fee,
        installments,
        libraryMember,
        hostelMember,
        transportMember,
      } = req.body;

      let data = {};

      if (!Array.isArray(installments))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please mention valid installments!",
          responseCode: "CLIENT_ERROR",
        });

      if (installments.length < 1)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please select the installment type!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(dependencies))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please mention valid dependencies!",
          responseCode: "CLIENT_ERROR",
        });

      if (dependencies.length < 1)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Please select a minimum of one dependency to create fee map!",
          responseCode: "CLIENT_ERROR",
        });

      for (let dependency of dependencies) {
        if (!VALID_DEPENDENCIES.includes(dependency))
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention valid dependencies!",
            responseCode: "CLIENT_ERROR",
          });
      }

      let receiptTitleWithGivenId = await receiptTitleQuery.findOne({
        _id: receiptTitleId,
      });
      if (!receiptTitleWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Receipt title not found!",
          responseCode: "CLIENT_ERROR",
        });

      let checkFilter = {};

      if (dependencies.includes("class")) {
        if (!classId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention class!",
            responseCode: "CLIENT_ERROR",
          });
        checkFilter["class"] = classId;
      }

      if (dependencies.includes("room")) {
        if (!roomId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention room!",
            responseCode: "CLIENT_ERROR",
          });
        checkFilter["room"] = roomId;
      }

      if (dependencies.includes("route")) {
        if (!routeId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention route!",
            responseCode: "CLIENT_ERROR",
          });
        checkFilter["route"] = routeId;
      }

      if (dependencies.includes("pickType")) {
        if (!pickType)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention pick type!",
            responseCode: "CLIENT_ERROR",
          });
        checkFilter["pickType"] = pickType;
      }

      if (dependencies.includes("stop")) {
        if (!stopId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention stop!",
            responseCode: "CLIENT_ERROR",
          });
        checkFilter["stop"] = stopId;
      }

      if (dependencies.includes("addedAfter")) {
        if (!addedAfter)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention added after!",
            responseCode: "CLIENT_ERROR",
          });
        checkFilter["addedAfter"] = new Date(addedAfter);
      }

      if (dependencies.includes("addedBefore")) {
        if (!addedBefore)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention added before!",
            responseCode: "CLIENT_ERROR",
          });
        checkFilter["addedBefore"] = new Date(addedBefore);
      }

      if (dependencies.includes("academicYear")) {
        if (!academicYearId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention academic year!",
            responseCode: "CLIENT_ERROR",
          });
        checkFilter["academicYear"] = new Date(academicYearId);
      }

      if (dependencies.includes("libraryMember")) {
        if (!libraryMember)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please mention library member status!",
            responseCode: "CLIENT_ERROR",
          });
        checkFilter["libraryMember"] = libraryMember;
      }

      let feeMapWithAboveDetailsExist = await feeMapQuery.findOne({
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
      data["collectedFrom"] = collectedFrom;

      if (collectedFrom === "student") {
        if (dependencies.includes("class")) {
          let classWithTheGivenId = await classQuery.findOne({
            _id: classId,
            school: req.schoolId,
          });
          if (!classWithTheGivenId)
            return common.failureResponse({
              statusCode: httpStatusCode.not_found,
              message: "Class with the given id was not found!",
              responseCode: "CLIENT_ERROR",
            });
          data["class"] = classId;
        }
      }

      if (dependencies.includes("route")) {
        let routeWithGivenId = await routeQuery.findOne({
          _id: routeId,
        });
        if (!routeWithGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Route with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["route"] = routeId;
        if (pickType) {
          data["pickType"] = pickType;
        }
      }
      if (dependencies.includes("stop")) {
        let stopWithTheGivenId = await stopQuery.findOne({
          _id: stopId,
        });
        if (!stopWithTheGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Stop with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["stop"] = stopId;
        let routeWithGivenStopId = await routeQuery.findOne({
          _id: stopWithTheGivenId.route,
        });
        if (!routeWithGivenStopId)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Route with given stop was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["route"] = stopWithTheGivenId.route;
        if (pickType) {
          data["pickType"] = pickType;
        }
      }

      if (dependencies.includes("hostel")) {
        let hostelWithGivenId = await hostelQuery.findOne({ _id: hostelId });
        if (!hostelWithGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Hostel with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["hostel"] = hostelId;
      }
      if (dependencies.includes("roomType")) {
        let roomTypeWithGivenId = await roomTypeQuery.findOne({
          _id: roomTypeId,
        });
        if (!roomTypeWithGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Room type with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["roomType"] = roomTypeId;
      }

      if (dependencies.includes("room")) {
        let roomWithGivenId = await roomQuery.findOne({
          _id: roomId,
          hostel: hostelId,
        });
        if (!roomWithGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Room with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["room"] = roomId;

        data["roomType"] = roomWithGivenId.type;
        data["hostel"] = roomWithGivenId.hostel;
      }

      if (dependencies.includes("academicYear")) {
        let academicYearWithGivenId = await academicYearQuery.findOne({
          _id: academicYearId,
        });
        if (!academicYearWithGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Academic year with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });

        data["academicYearId"] = academicYearId;
      }

      if (dependencies.includes("addedAfter")) {
        data["addedAfter"] = new Date(addedAfter);
      }

      if (dependencies.includes("addedBefore")) {
        data["addedBefore"] = new Date(addedBefore);
      }
      if (dependencies.includes("libraryMember")) {
        data["libraryMember"] = "yes";
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

      let activeAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!activeAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found!",
          responseCode: "CLIENT_ERROR",
        });

      data["academicYear"] = activeAcademicYear._id;

      let newFeeMap = await feeMapQuery.create(data);

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
        collectedFrom,
        dependencies,
        classId,
        routeId,
        pickType,
        roomId,
        fee,
        installments,
        roomTypeId,
        academicYearId,
        addedAfter,
        addedBefore,
        stopId,
        libraryMember,
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

      let activeAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!activeAcademicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found!",
          responseCode: "CLIENT_ERROR",
        });

      let feeMapWithGivenId = await feeMapQuery.findOne({
        _id: feeMapId,
        academicYear: activeAcademicYear._id,
      });

      if (!feeMapWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Fee map with the given id was not found!",
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
            "This fee map cannot be modified as fee receipt has already been created for this fee map",
          responseCode: "CLIENT_ERROR",
        });

      let data = {};

      let receiptTitleWithGivenId = await receiptTitleQuery.findOne({
        _id: receiptTitleId,
      });
      if (!receiptTitleWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Receipt title with the given id was not found!",
          responseCode: "CLIENT_ERROR",
        });

      let checkFilter = {};

      if (dependencies.includes("class")) {
        checkFilter["class"] = classId;
      }
      if (dependencies.includes("room")) {
        checkFilter["room"] = roomId;
      }
      if (dependencies.includes("route")) {
        checkFilter["route"] = routeId;
      }
      if (dependencies.includes("pickType")) {
        checkFilter["pickType"] = pickType;
      }
      if (dependencies.includes("roomType")) {
        checkFilter["roomType"] = roomTypeId;
      }
      if (dependencies.includes("stop")) {
        checkFilter["stop"] = stopId;
      }
      if (dependencies.includes("addedAfter")) {
        checkFilter["addedAfter"] = new Date(addedAfter);
      }
      if (dependencies.includes("addedBefore")) {
        checkFilter["addedBefore"] = new Date(addedBefore);
      }
      if (dependencies.includes("academicYear")) {
        checkFilter["academicYear"] = new Date(academicYearId);
      }
      if (dependencies.includes("libraryMember")) {
        checkFilter["libraryMember"] = libraryMember;
      }

      let feeMapWithAboveDetailsExist = await feeMapQuery.findOne({
        receiptTitle: receiptTitleId,
        dependencies: { $all: dependencies },
        ...checkFilter,
      });

      if (
        feeMapWithAboveDetailsExist &&
        feeMapWithAboveDetailsExist.dependencies.length ===
          dependencies.length &&
        feeMapWithAboveDetailsExist._id.toHexString() !== feeMapId
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Fee map with given details already exists!",
          responseCode: "CLIENT_ERROR",
        });

      data["receiptTitle"] = receiptTitleId;

      for (let dependency of dependencies) {
        if (!VALID_DEPENDENCIES.includes(dependency))
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please provide valid dependencies!",
            responseCode: "CLIENT_ERROR",
          });
      }

      data["dependencies"] = dependencies;
      data["extendedDependencies"] = getExtentedDependencies(dependencies);
      data["collectedFrom"] = collectedFrom;

      if (collectedFrom === "student") {
        if (dependencies.includes("class")) {
          let classWithTheGivenId = await classQuery.findOne({
            _id: classId,
            school: req.schoolId,
          });
          if (!classWithTheGivenId)
            return common.failureResponse({
              statusCode: httpStatusCode.not_found,
              message: "Class with the given id was not found!",
              responseCode: "CLIENT_ERROR",
            });
          data["class"] = classId;
        }
      }

      if (dependencies.includes("route")) {
        let routeWithGivenId = await routeQuery.findOne({
          _id: routeId,
        });
        if (!routeWithGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Route with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["route"] = routeId;
      }
      if (dependencies.includes("stop")) {
        let stopWithTheGivenId = await stopQuery.findOne({
          _id: stopId,
        });
        if (!stopWithTheGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Stop with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["stop"] = stopId;
        let routeWithGivenStopId = await routeQuery.findOne({
          _id: routeId,
          stops: { $in: [stopId] },
        });
        if (!routeWithGivenStopId)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Route with the given stop was not found!",
            responseCode: "CLIENT_ERROR",
          });

        data["route"] = routeId;
      }
      if (dependencies.includes("pickType")) {
        if (!["Both", "Pick", "Drop"].includes(pickType)) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Invalid pick type selected!",
            responseCode: "CLIENT_ERROR",
          });
        }
        data["pickType"] = pickType;
      }

      if (dependencies.includes("room")) {
        let roomWithGivenId = await Room.findOne({
          _id: roomId,
        });
        if (!roomWithGivenId)
          return commom.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Room with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });
        data["room"] = roomId;

        data["roomType"] = roomWithGivenId.type;
        data["hostel"] = roomWithGivenId.hostel;
      }

      if (dependencies.includes("academicYear")) {
        let academicYearWithGivenId = await academicYearQuery.findOne({
          _id: academicYearId,
        });
        if (!academicYearWithGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Academic year with the given id was not found!",
            responseCode: "CLIENT_ERROR",
          });

        data["academicYearId"] = academicYearId;
      }

      if (dependencies.includes("addedAfter")) {
        data["addedAfter"] = new Date(addedAfter);
      }

      if (dependencies.includes("addedBefore")) {
        data["addedBefore"] = new Date(addedBefore);
      }

      if (dependencies.includes("libraryMember")) {
        data["libraryMember"] = "yes";
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

      let feeMapCategories = await feeMapCategoryQuery.find({
        feeMap: feeMapId,
      });
      let totalFeeCategoryAmount = feeMapCategories.reduce(
        (total, current) => total + Number(current.amount),
        0
      );
      if (feeMapCategories.length && totalFeeCategoryAmount !== fee) {
        let multiplier = fee / totalFeeCategoryAmount;
        await feeMapCategoryQuery.updateMany(
          { feeMap: feeMapId },
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
        { _id: id },
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
