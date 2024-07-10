const itemService = require("@services/helper/inventory/item");

module.exports = class ItemController {
  async create(req) {
    try {
      const result = await itemService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await itemService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await itemService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadPdf(req) {
    try {
      const result = await itemService.downloadPdf(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadExcel(req) {
    try {
      const result = await itemService.downloadExcel(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
