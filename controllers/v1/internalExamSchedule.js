const internalExamScheduleHelper = require("@services/helper/internalExamSchedule");

module.exports = class InternalExamScheduleController {
  async create(req) {
    try {
      const createdInternalExamSchedule =
        await internalExamScheduleHelper.create(req);
      return createdInternalExamSchedule;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const allInternalExamSchedules = await internalExamScheduleHelper.list(
        req
      );
      return allInternalExamSchedules;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedInternalExamSchedule =
        await internalExamScheduleHelper.update(req);
      return updatedInternalExamSchedule;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await internalExamScheduleHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
