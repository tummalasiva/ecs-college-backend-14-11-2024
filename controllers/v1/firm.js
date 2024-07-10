const firmService = require("@services/helper/firm");

module.exports = class FirmController {
  async create(req) {
    try {
      const result = await firmService.create(req.body);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await firmService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const params = req.body;
    const _id = req.params.id;
    try {
      const result = await firmService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await firmService.delete(_id, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await firmService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
