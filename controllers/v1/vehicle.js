const vehicleService = require("@services/helper/vehicle");

module.exports = class VehicleController {
  async create(req) {
    try {
      const result = await vehicleService.create(req.body);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await vehicleService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const params = req.body;
    const _id = req.params.id;
    try {
      const result = await vehicleService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await vehicleService.delete(_id, req.employee);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await vehicleService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
