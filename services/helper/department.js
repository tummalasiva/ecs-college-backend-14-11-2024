const departmentQuery = require("@db/department/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");

module.exports = class departmentService {
  static async create(body) {
    const { name, code } = body;
    try {
      const departmentExist = await departmentQuery.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
      if (departmentExist) {
        return common.failureResponse({
          message: "Department already exists",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      let departmentCount = await departmentQuery.findAll();
      const department = await departmentQuery.create({
        name,
        orderSequence: departmentCount.length + 1,
        code,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Department created successfully",
        result: department,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      let departmentList = await departmentQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: departmentList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      const { name, orderSequence, note } = body;
      let departmentWithName = await departmentQuery.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
      if (departmentWithName)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Department with given name already exists! Please try with another name",
          responseCode: "CLIENT_ERROR",
        });

      let departmentWithGivenId = await departmentQuery.findOne({ _id: id });
      if (!departmentWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Department not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (departmentWithGivenId.orderSequence !== orderSequence) {
        let departmentWithGivenOrderSequence = await departmentQuery.findOne({
          orderSequence,
        });
        if (!departmentWithGivenOrderSequence) {
          let updatedDepartment = await departmentQuery.updateOne(
            { _id: id },
            { $set: { orderSequence, name, code } },
            { new: true }
          );
          return common.successResponse({
            result: updatedDepartment,
            message: "Department updated successfully!",
            statusCode: httpStatusCode.ok,
          });
        } else {
          let orderSequenceForSecondDepartment =
            departmentWithGivenId.orderSequence;

          let updatedDepartment = await departmentQuery.updateOne(
            { _id: id },
            { $set: { orderSequence, name, code } },
            { new: true }
          );
          let secondDepartment = await departmentQuery.updateOne(
            { _id: departmentWithGivenOrderSequence._id },
            { $set: { orderSequence: orderSequenceForSecondDepartment } }
          );

          return common.successResponse({
            result: updatedDepartment,
            message: "Department updated successfully!",
            statusCode: httpStatusCode.ok,
          });
        }
      } else {
        let updatedDepartment = await departmentQuery.updateOne(
          { _id: id },
          { $set: { orderSequence, name, note } },
          { new: true }
        );
        return common.successResponse({
          result: updatedDepartment,
          message: "Department updated successfully!",
          statusCode: httpStatusCode.ok,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let department = await departmentQuery.delete({
        _id: id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Department deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let department = await departmentQuery.findOne({ _id: id });

      if (department) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Department fetched successfully",
          result: department,
        });
      } else {
        return common.failureResponse({
          message: "Failed to find the department details",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
