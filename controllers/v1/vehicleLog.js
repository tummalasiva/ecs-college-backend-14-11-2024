const vehicleLogService = require("@services/helper/vehicleLog");

module.exports = class VehicleLogController {
  async create(req) {
    try {
      const result = await vehicleLogService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await vehicleLogService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const params = req.body;
    const _id = req.params.id;
    try {
      const result = await vehicleLogService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await vehicleLogService.delete(_id, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadPdf(req) {
    try {
      const result = await vehicleLogService.downloadPdf(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
