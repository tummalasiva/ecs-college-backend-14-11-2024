const roomTypeService = require("@services/helper/roomType");

module.exports = class RoomTypeController {
  async create(req) {
    try {
      const result = await roomTypeService.create(req.body);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await roomTypeService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = { ...req.body };
    const _id = req.params.id;
    try {
      const result = await roomTypeService.update(_id, bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await roomTypeService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await roomTypeService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
