const classQuery = require("@db/class/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class ClassService {
  static async create(req) {
    const body = req.body;
    const school = req.schoolId;
    try {
      const classExist = await classQuery.findOne({
        name: { $regex: new RegExp(`^${body.name}$`, "i") },
        school,
      });
      if (classExist) {
        return common.failureResponse({
          message: "Class with the given name already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const newClass = await classQuery.create({ ...body, school });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Class added successfully!",
        result: newClass,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      let classList = await classQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: classList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async listPublic(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }
      filter["active"] = true;
      filter["isPublic"] = true;

      let classList = await classQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: classList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      const { orderSequence } = body;
      let existDoc = await classQuery.findOne({
        name: { $regex: new RegExp(`^${body.name}$`, "i") },
        _id: { $ne: id },
      });
      if (existDoc) {
        return common.failureResponse({
          message: "Class with this name already exists! Try with another name",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      let classWithGivenId = await classQuery.findOne({ _id: id });
      if (!classWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Class not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (classWithGivenId.orderSequence !== orderSequence) {
        let classWithGivenOrderSequence = await classQuery.findOne({
          orderSequence,
          school: classWithGivenId.school._id,
        });
        if (!classWithGivenOrderSequence) {
          let updatedClass = await classQuery.updateOne(
            { _id: id },
            { $set: { ...body } },
            { new: true }
          );
          return common.successResponse({
            result: updatedClass,
            message: `Class ${classWithGivenId.name} updated successfully!`,
            statusCode: httpStatusCode.ok,
          });
        } else {
          let orderSequenceForSecondClass = classWithGivenId.orderSequence;

          let updatedClass = await classQuery.updateOne(
            { _id: id },
            { $set: { ...body } },
            { new: true }
          );
          let secondClass = await classQuery.updateOne(
            { _id: classWithGivenOrderSequence._id },
            { $set: { orderSequence: orderSequenceForSecondClass } }
          );

          return common.successResponse({
            result: updatedClass,
            message: `Class ${classWithGivenId.name} updated successfully!`,
            statusCode: httpStatusCode.ok,
          });
        }
      } else {
        let updatedClass = await classQuery.updateOne(
          { _id: id },
          { $set: { ...body } },
          { new: true }
        );
        return common.successResponse({
          result: updatedClass,
          message: `Class ${classWithGivenId.name} updated successfully!`,
          statusCode: httpStatusCode.ok,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let classes = await classQuery.delete({ _id: id });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Class deleted successfully!",
        result: classes,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let classData = await classQuery.findOne({ _id: id });

      if (classData) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          result: classData,
        });
      } else {
        return common.failureResponse({
          message: "Class not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
