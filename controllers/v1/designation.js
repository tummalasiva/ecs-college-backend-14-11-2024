const designationService = require("@services/helper/designation");

module.exports = class DesignationController {
  async create(req) {
    const params = req.body;
    try {
      const result = await designationService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await designationService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    const _id = req.params.id;
    try {
      const result = await designationService.update(
        _id,
        bodyData,
        req.employee
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await designationService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await designationService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
