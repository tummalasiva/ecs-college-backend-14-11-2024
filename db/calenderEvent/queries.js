const CalendarEvent = require("./model");

module.exports = class CalendarEventData {
  static async create(data) {
    try {
      const result = await new CalendarEvent(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter = {}) {
    try {
      const result = await CalendarEvent.find(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findOne(filter = {}) {
    try {
      const result = await CalendarEvent.findOne(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter = {}) {
    try {
      const result = await CalendarEvent.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, update = {}, options = {}) {
    try {
      const result = await CalendarEvent.findOneAndUpdate(
        filter,
        update,
        options
      );
      return result;
    } catch (error) {
      throw error;
    }
  }
};
