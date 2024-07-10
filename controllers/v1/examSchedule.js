const examScheduleService = require("@services/helper/examSchedule");

module.exports = class ExamScheduleController {
  async create(req) {
    try {
      const result = await examScheduleService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await examScheduleService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await examScheduleService.listPublic(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    const _id = req.params.id;
    try {
      const result = await examScheduleService.update(_id, bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await examScheduleService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await examScheduleService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async generateHallTicket(req) {
    try {
      const result = await examScheduleService.generateHallTicket(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
