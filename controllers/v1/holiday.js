const holidayService = require("@services/helper/holiday");

module.exports = class HolidayController {
  async create(req) {
    const params = { ...req.body, school: req.schoolId };
    try {
      const result = await holidayService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await holidayService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async listPublic(req) {
    try {
      const result = await holidayService.listPublic(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = { ...req.body, school: req.schoolId };
    const _id = req.params.id;
    try {
      const result = await holidayService.update(_id, bodyData, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await holidayService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await holidayService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
