const bookIssueService = require("@services/helper/library/bookIssue");

module.exports = class BookIssueController {
  async create(req) {
    let bodyData = { ...req.body, school: req.schoolId };
    try {
      const result = await bookIssueService.create(bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await bookIssueService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async submit(req) {
    const bodyData = req.body;
    const _id = req.params.id;
    try {
      const result = await bookIssueService.submit(_id, bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await bookIssueService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await bookIssueService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadExcel(req) {
    try {
      const result = await bookIssueService.downloadExcel(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadPdf(req) {
    try {
      const result = await bookIssueService.downloadPdf(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
