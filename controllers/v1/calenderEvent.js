const calenderEventService = require("@services/helper/calenderEvent");

module.exports = class CalenderEventController {
  async create(req) {
    try {
      const result = await calenderEventService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await calenderEventService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await calenderEventService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteCalenderEvent(req) {
    try {
      const result = await calenderEventService.deleteCalenderEvent(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await calenderEventService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
