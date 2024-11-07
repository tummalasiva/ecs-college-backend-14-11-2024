const codeOfConductHelper = require("@services/helper/codeOfConduct");

module.exports = class CodeOfConductController {
  async create(req) {
    try {
      const result = await codeOfConductHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async lsit(req) {
    try {
      const result = await codeOfConductHelper.lsit(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await codeOfConductHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await codeOfConductHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
