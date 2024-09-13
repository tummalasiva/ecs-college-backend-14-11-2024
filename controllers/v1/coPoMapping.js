const coPoMappingService = require("@services/helper/coPoMapping");

module.exports = class CoPoMappingController {
  async create(req) {
    try {
      const result = await coPoMappingService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await coPoMappingService.findAll(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await coPoMappingService.updateOne(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await coPoMappingService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
