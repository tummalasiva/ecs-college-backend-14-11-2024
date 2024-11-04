const leaveTypeQuery = require("@db/leaveType/queries");
const departmentQuery = require("@db/department/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class LeaveTypeService {
  static async create(bodyData) {
    try {
      const {
        numberOfLeaves,
        isAutoEarned,
        canCarryForward,
        needsGuardianApproval,
        carryForwardCount,
        leaveTypeFor,
        name,
        departments,
        isSpecial,
      } = bodyData;

      if (leaveTypeFor.toLowerCase() === "student") {
        let studentLeaveWithThisName = await leaveTypeQuery.findOne({
          name: { $regex: new RegExp(`^${name}$`, "i") },
          leaveTypeFor: "Student",
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
          needsGuardianApproval,
        });

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Leave type created successfully!",
          result: newLeaveType,
        });
      } else {
        // case 1 : total leaves cannot be more than canCarrry forward count if canCarryForward is true;

        if (JSON.parse(canCarryForward)) {
          if (numberOfLeaves < carryForwardCount)
            return common.failureResponse({
              message:
                "Number of leaves cannot be less than carry forward count if canCarryForward is true!",
              statusCode: httpStatusCode.bad_request,
              responseCode: "CLIENT_ERROR",
            });
        }

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
        });
        if (employeeLeaveWithThisName)
          return common.failureResponse({
            message: "Leave type with this name for Employee already exists!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });

        let newLeaveType = await leaveTypeQuery.create({
          name: name,
          isAutoEarned,
          canCarryForward,
          carryForwardCount: canCarryForward ? carryForwardCount : 0,
          isSpecial,
          departments: departments,
          leaveTypeFor: "Employee",
          numberOfLeaves,
        });

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Leave type is created successfully!!!",
          result: newLeaveType,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    let filter = { ...search };

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

      const {
        needsGuardianApproval,
        numberOfLeaves,
        isAutoEarned,
        canCarryForward,
        carryForwardCount,
        name,
        departments,
        isSpecial,
      } = body;

      let requestedLeave = await leaveTypeQuery.findOne({
        _id: leaveTypeId,
      });

      if (requestedLeave.leaveTypeFor === "Student") {
        if (
          name.trim().toLowerCase() !== requestedLeave.name.trim().toLowerCase()
        ) {
          let leaveTypeWithGivenName = await leaveTypeQuery.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") },
            leaveTypeFor: "Student",
            _id: { $ne: leaveTypeId },
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
          { $set: { name: name.trim(), needsGuardianApproval } },
          { new: true }
        );
        return common.successResponse({
          message: "Leave type updated successfully!",
          result: updatedLeaveType,
          statusCode: httpStatusCode.ok,
        });
      } else {
        if (JSON.parse(canCarryForward)) {
          if (numberOfLeaves < carryForwardCount)
            return common.failureResponse({
              message:
                "Number of leaves cannot be less than carry forward count if canCarryForward is true!",
              statusCode: httpStatusCode.bad_request,
              responseCode: "CLIENT_ERROR",
            });
        }

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
            _id: { $ne: leaveTypeId },
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
              isAutoEarned,
              canCarryForward,
              carryForwardCount: canCarryForward ? carryForwardCount : 0,
              isSpecial,
              departments: departments,
              numberOfLeaves,
            },
          },
          { new: true }
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
