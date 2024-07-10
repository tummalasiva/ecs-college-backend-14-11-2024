const storageService = require("@services/helper/storage");

module.exports = class StorageController {
  async getDetails(req) {
    try {
      const result = await storageService.getDetails();
      return result;
    } catch (error) {
      return error;
    }
  }
};
