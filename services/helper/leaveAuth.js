const leaveAuthQuery = require("@db/leaveAuth/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class LeaveAuthHelper {
  static async update(req) {
    try {
      const { employees, canBeApprovedBy } = req.body;
      if (!Array.isArray(employees))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Employees should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      const updatedLeaveAuth = await leaveAuthQuery.updateOne(
        {
          canBeApprovedBy,
        },
        {
          $addToSet: { employees: { $each: employees } },
        },
        {
          upsert: true,
        }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Leave authorities updated successfully!",
        result: updatedLeaveAuth,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(req) {
    try {
      const { canBeApprovedBy } = req.query;
      const leaveAuth = await leaveAuthQuery.findOne({ canBeApprovedBy });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Leave authorities details fetched successfully!",
        result: leaveAuth,
      });
    } catch (error) {
      throw error;
    }
  }
};
