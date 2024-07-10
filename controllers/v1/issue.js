const issueService = require("@services/helper/inventory/issue");

module.exports = class ItemIssueController {
  async create(req) {
    try {
      const result = await issueService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateStatus(req) {
    try {
      const result = await issueService.updateStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await issueService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadPdf(req) {
    try {
      const result = await issueService.downloadPdf(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadExcel(req) {
    try {
      const result = await issueService.downloadExcel(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getTotalInventoryAmount(req) {
    try {
      const result = await issueService.getTotalInventoryAmount(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
