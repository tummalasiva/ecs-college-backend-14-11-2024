const leaveTypeQuery = require("@db/leaveType/queries");
const departmentQuery = require("@db/department/queries");
const employeeQuery = require("@db/employee/queries");
const leaveApplicationQuery = require("@db/leaveApplication/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class LeaveTypeService {
  static async create(bodyData) {
    try {
      const {
        total,
        autoEarnCount,
        canResetCarryForward,
        carryForwardCount,
        leaveTypeFor,
        name,
        departments,
        autoEarned,
        isSpecial,
        school,
      } = bodyData;

      if (leaveTypeFor.toLowerCase() === "student") {
        let studentLeaveWithThisName = await leaveTypeQuery.findOne({
          name: { $regex: new RegExp(`^${name}$`, "i") },
          leaveTypeFor: "Student",
          school,
        });
        if (studentLeaveWithThisName)
          return common.failureResponse({
            message: "Leave type with this name for Student already exists!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });

        let newLeaveType = await leaveTypeQuery.create({
          name: name,
          leaveTypeFor: "Student",
          school,
        });

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Leave type created successfully!",
          result: newLeaveType,
        });
      } else {
        if (
          parseInt(total) <
          parseInt(carryForwardCount) + parseInt(autoEarnCount)
        )
          return common.failureResponse({
            message:
              "Total cannot be less than sum of carry forward count and auto earned count!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });

        let givenDepartments = await departmentQuery.findAll({
          _id: { $in: departments },
        });
        if (givenDepartments.length !== departments.length)
          return common.failureResponse({
            message: "Department not found!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });

        let employeeLeaveWithThisName = await leaveTypeQuery.findOne({
          name: { $regex: new RegExp(`^${name}$`, "i") },
          leaveTypeFor: "Employee",
          school,
        });
        if (employeeLeaveWithThisName)
          return common.failureResponse({
            message: "Leave type with this name for Employee already exists!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });

        let newLeaveType = await leaveTypeQuery.create({
          name: name,
          autoEarned,
          autoEarnCount: autoEarned ? autoEarnCount : 0,
          canResetCarryForward,
          carryForwardCount: canResetCarryForward ? carryForwardCount : 0,
          isSpecial,
          departments: departments,
          leaveTypeFor: "Employee",
          total: total,
          school,
        });

        let createdleave = await leaveTypeQuery.findOne({
          _id: newLeaveType._id,
        });

        await employeeQuery.updateMany(
          { school },
          {
            $addToSet: {
              currentLeaveCredits: { ...createdleave, totalTaken: 0 },
            },
          },
          { new: true }
        );

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Leave type is created successfully!!!",
          result: createdleave,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    let filter = { ...search };
    if (req.schoolId) {
      filter["school"] = req.schoolId;
    }

    try {
      let leaveTypes = await leaveTypeQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Leave Types fetched successfully",
        result: leaveTypes,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      const leaveTypeId = id;
      // let leaveApplicationWithGivenLeaveType =
      //   await leaveApplicationQuery.findOne({
      //     leaveType: leaveTypeId,
      //   });
      // if (leaveApplicationWithGivenLeaveType)
      //   return common.failureResponse({
      //     statusCode: httpStatusCode.bad_request,
      //     message:
      //       "This leave type cannot be modified. Leave application with the given leave type exists.",
      //     responseCode: "CLIENT_ERROR",
      //   });

      const {
        total,
        autoEarnCount,
        canResetCarryForward,
        carryForwardCount,
        name,
        departments,
        autoEarned,
        isSpecial,
        school,
      } = body;

      let requestedLeave = await leaveTypeQuery.findOne({
        _id: leaveTypeId,
        school,
      });

      if (requestedLeave.leaveTypeFor === "Student") {
        if (
          name.trim().toLowerCase() !== requestedLeave.name.trim().toLowerCase()
        ) {
          let leaveTypeWithGivenName = await leaveTypeQuery.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") },
            leaveTypeFor: "Student",
            school,
          });
          if (leaveTypeWithGivenName)
            return common.failureResponse({
              message: "Leave type with this name for Student already exists!",
              statusCode: httpStatusCode.bad_request,
              responseCode: "CLIENT_ERROR",
            });
        }

        let updatedLeaveType = await leaveTypeQuery.updateOne(
          { _id: leaveTypeId },
          { $set: { name: name.trim() } },
          { new: true }
        );
        return common.successResponse({
          message: "Leave type updated successfully!",
          result: updatedLeaveType,
          statusCode: httpStatusCode.ok,
        });
      } else {
        if (total < carryForwardCount + autoEarnCount)
          return common.failureResponse({
            message:
              "Total cannot be less than sum of carry forward count and auto earned count!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });

        let givenDepartments = await departmentQuery.findAll({
          _id: { $in: departments },
        });
        if (givenDepartments.length !== departments.length)
          return common.failureResponse({
            message: "Department not found!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });

        if (
          name.trim().toLowerCase() !== requestedLeave.name.trim().toLowerCase()
        ) {
          let employeeLeaveWithThisName = await leaveTypeQuery.findOne({
            name: { $regex: new RegExp(`^${name}%`, "i") },
            leaveTypeFor: "Employee",
            school,
          });
          if (employeeLeaveWithThisName)
            return common.failureResponse({
              message: "Leave type with this name for Employee already exists!",
              statusCode: httpStatusCode.bad_request,
              responseCode: "CLIENT_ERROR",
            });
        }

        let updatedLeaveType = await leaveTypeQuery.updateOne(
          { _id: leaveTypeId },
          {
            $set: {
              name: name.trim(),
              autoEarned,
              autoEarnCount: autoEarned ? autoEarnCount : 0,
              canResetCarryForward,
              carryForwardCount: canResetCarryForward ? carryForwardCount : 0,
              isSpecial,
              departments: departments,
              total: total,
            },
          },
          { new: true }
        );

        await employeeQuery.updateMany(
          { "currentLeaveCredits._id": updatedLeaveType._id },
          {
            $set: {
              "currentLeaveCredits.$": { ...updatedLeaveType, totalTaken: 0 },
            },
          }
        );

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Leave type updated successfully!",
          result: updatedLeaveType,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let leaveTypeWithGivenId = await leaveTypeQuery.findOne({ _id: id });
      if (!leaveTypeWithGivenId)
        return common.failureResponse({
          message: "Leave type not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      await employeeQuery.updateMany(
        { "currentLeaveCredits._id": id },
        {
          $pull: {
            currentLeaveCredits: { _id: id },
          },
        }
      );

      await leaveTypeQuery.delete({ _id: id });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Leave type deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
