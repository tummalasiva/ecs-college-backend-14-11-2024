const slotService = require("@services/helper/slot");

module.exports = class SlotController {
  async create(req) {
    try {
      const createdSlot = await slotService.create(req);
      return createdSlot;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const slots = await slotService.list(req);
      return slots;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedSlot = await slotService.update(req);
      return updatedSlot;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const deletedSlot = await slotService.delete(req);
      return deletedSlot;
    } catch (error) {
      return error;
    }
  }
};
