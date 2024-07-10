const receiptTitleService = require("@services/helper/fee/receiptTitle");

module.exports = class ReceiptTitleController {
  async create(req) {
    const params = { ...req.body, createdBy: req.employee._id };
    try {
      const result = await receiptTitleService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await receiptTitleService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = req.body;
    const _id = req.params.id;
    try {
      const result = await receiptTitleService.update(_id, bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleActiveStatus(req) {
    const _id = req.params.id;
    try {
      const result = await receiptTitleService.toggleActiveStatus(
        _id,
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
      const result = await receiptTitleService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await receiptTitleService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
