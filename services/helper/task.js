const taskQuery = require("@db/task/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3 } = require("../../helper/helpers");

module.exports = class TaskService {
  static async create(req) {
    try {
      let files = [];
      if (req.files) {
        if (Array.isArray(req.files)) {
          for (let file of req.files) {
            let uploadedFile = await uploadFileToS3(file);
            files.push(uploadedFile);
          }
        } else {
          let uploadedFile = await uploadFileToS3(req.files.file);
          files.push(uploadedFile);
        }
      }

      let newTask = await taskQuery.create({ ...req.body, files });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Task created successfully",
        result: newTask,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const filter = { ...search };
      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }

      const result = await taskQuery.findAll(filter);
      return common.successResponse({
        result,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const updatedTask = await taskQuery.updateOne(
        { _id: req.params.id },
        req.body
      );
      return common.successResponse({
        result: updatedTask,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await taskQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Task deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
