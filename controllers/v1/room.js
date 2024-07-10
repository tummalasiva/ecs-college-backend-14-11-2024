const roomService = require("@services/helper/room");

module.exports = class RoomController {
  async create(req) {
    try {
      const result = await roomService.create(req.body);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await roomService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = { ...req.body };
    const _id = req.params.id;
    try {
      const result = await roomService.update(_id, bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await roomService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateBed(req) {
    const _id = req.params.id;
    try {
      const result = await roomService.updateBed(_id, req.body);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteBed(req) {
    const _id = req.params.id;
    try {
      const result = await roomService.deleteBed(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await roomService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
