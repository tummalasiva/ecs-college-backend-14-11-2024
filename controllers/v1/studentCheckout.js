const studentCheckoutService = require("@services/helper/studentCheckout");

module.exports = class StudentCheckoutController {
  async list(req) {
    try {
      const result = await studentCheckoutService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await studentCheckoutService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await studentCheckoutService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadPdf(req) {
    try {
      const result = await studentCheckoutService.downloadPdf(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadExcel(req) {
    try {
      const result = await studentCheckoutService.downloadExcel(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
