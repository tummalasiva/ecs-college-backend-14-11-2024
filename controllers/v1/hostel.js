const hostelService = require("@services/helper/hostel");

module.exports = class HostelController {
  async create(req) {
    try {
      const result = await hostelService.create(req.body);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await hostelService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    const bodyData = { ...req.body };
    const _id = req.params.id;
    try {
      const result = await hostelService.update(_id, bodyData);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    const _id = req.params.id;
    try {
      const result = await hostelService.delete(_id);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    const _id = req.params.id;
    try {
      const result = await hostelService.details(_id);
      return result;
    } catch (error) {
      return error;
    }
  }
};
