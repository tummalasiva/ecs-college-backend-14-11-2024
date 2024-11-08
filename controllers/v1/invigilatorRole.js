const invigilatorRoleHelper = require("@services/helper/invigilatorRole");

module.exports = class InvigilatorRoleController {
  async create(req) {
    try {
      const result = await invigilatorRoleHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await invigilatorRoleHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await invigilatorRoleHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await invigilatorRoleHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
