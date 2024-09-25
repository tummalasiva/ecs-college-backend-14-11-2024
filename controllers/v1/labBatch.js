const labBatchService = require("@services/helper/labBatch");

module.exports = class LabBatchController {
  async create(req) {
    try {
      const result = await labBatchService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await labBatchService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async addStudents(req) {
    try {
      const result = await labBatchService.addStudents(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async removeStudents(req) {
    try {
      const result = await labBatchService.removeStudents(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await labBatchService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await labBatchService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
