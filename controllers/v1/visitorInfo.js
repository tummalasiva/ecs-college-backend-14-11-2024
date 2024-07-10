const visitorInfoService = require("@services/helper/visitorInfo");

module.exports = class VisitorInfoController {
  async create(req) {
    const params = {
      ...req.body,
      school: req.schoolId,
      enteredBy: req.employee._id,
    };
    try {
      const result = await visitorInfoService.create(params);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await visitorInfoService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await visitorInfoService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await visitorInfoService.delete(_id, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await visitorInfoService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadVisitorInfoExcel(req) {
    try {
      const result = await visitorInfoService.downloadVisitorInfoExcel(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadVisitorInfoPdf(req) {
    try {
      const result = await visitorInfoService.downloadVisitorInfoPdf(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
