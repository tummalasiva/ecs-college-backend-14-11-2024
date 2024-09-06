const buildingRoomHelper = require("@services/helper/buildingRoom");

module.exports = class BuildingRoomController {
  async create(req) {
    try {
      const result = await buildingRoomHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await buildingRoomHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await buildingRoomHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await buildingRoomHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleAvailableStatus(req) {
    try {
      const result = await buildingRoomHelper.toggleAvailableStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
