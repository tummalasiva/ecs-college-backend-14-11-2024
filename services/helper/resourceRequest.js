const resourceRequestQuery = require("@db/resourceRequest/queries");
const employeeQuery = require("@db/employee/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class ResourceRequestQuery {
  static async create(req) {
    try {
      const employee = await employeeQuery.findOne({ _id: req.employee });
      if (!employee)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Employee not found!",
          responseCode: "CLIENT_ERROR",
        });

      let newResourceRequest = await resourceRequestQuery.create({
        ...req.body,
        department: employee.academicInfo.department?._id,
        requestedBy: employee._id,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Resource request added successfully!",
        result: newResourceRequest,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.employee && filter.requestedBy) {
        filter["requestedBy"] = req.employee;
      }

      let resourceRequests = await resourceRequestQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Resource requests fetched successfully!",
        result: resourceRequests,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const resourceRequest = await resourceRequestQuery.findOne({
        _id: req.params.id,
      });

      if (!resourceRequest)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Resource request not found!",
          responseCode: "CLIENT_ERROR",
        });

      let updatedResourceRequest = await resourceRequestQuery.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Resource request updated successfully!",
        result: updatedResourceRequest,
      });
    } catch (error) {
      throw error;
    }
  }
};
