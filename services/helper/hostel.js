const hostelQuery = require("@db/hostel/queries");
const employeeQuery = require("@db/employee/queries");
const roleQuery = require("@db/role/queries");
const studentQuery = require("@db/student/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class Hostelservice {
  static async create(body) {
    try {
      const { name, warden } = body;
      const hostelExist = await hostelQuery.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });

      if (hostelExist)
        return common.failureResponse({
          message: "Hostel already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let warderRoleId = await roleQuery.findOne({
        name: { $regex: new RegExp(`^${"Warden"}$`, "i") },
      });
      if (!warderRoleId)
        return common.failureResponse({
          message: "Warden role not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let employeeWithWardenRole = await employeeQuery.findOne({
        role: warderRoleId._id,
        _id: warden,
      });
      if (!employeeWithWardenRole)
        return common.failureResponse({
          message: "Employee with warder role not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newHostel = await hostelQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Hostel created successfully!",
        result: newHostel,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    let filter = { ...search };

    try {
      let hostels = await hostelQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Hostels fetched successfully",
        result: hostels,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      const { name, warden } = body;
      const hostelExist = await hostelQuery.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (hostelExist) {
        return common.failureResponse({
          message: "Hostel with this name already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      if (warden) {
        let warderRoleId = await roleQuery.findOne({
          name: { $regex: new RegExp(`^${"Warden"}$`, "i") },
        });
        if (!warderRoleId)
          return common.failureResponse({
            message: "Warden role not found!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });

        let employeeWithWardenRole = await employeeQuery.findOne({
          role: warderRoleId._id,
          _id: warden,
        });
        if (!employeeWithWardenRole)
          return common.failureResponse({
            message: "Employee with warder role not found!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });
      }

      let hostel = await hostelQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (hostel) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Hostel updated successfully!",
          result: hostel,
        });
      } else {
        return common.failureResponse({
          message: "Hostel data not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let studentWithThisHostel = await studentQuery.findOne({
        "hostelInfo.name": id,
      });
      if (studentWithThisHostel) {
        return common.failureResponse({
          message:
            "Cannot delete hostel as it is associated with some students!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      let hostels = await hostelQuery.delete({ _id: id });

      if (hostels) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Hostel deleted successfully!",
          result: hostels,
        });
      } else {
        return common.failureResponse({
          message: "Hostel not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let Hostel = await hostelQuery.findOne({ _id: id });

      if (Hostel) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Hostel fetched successfully",
          result: Hostel,
        });
      } else {
        return common.failureResponse({
          message: "Hostel not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
