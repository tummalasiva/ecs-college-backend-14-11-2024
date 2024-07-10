const Ticket = require("./model");

module.exports = class TicketData {
  static async create(data) {
    try {
      const result = await new Ticket(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Ticket.find(filter).populate("schoolId").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findOne(filter = {}) {
    try {
      const result = await Ticket.findOne(filter).populate("schoolId").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Ticket.findOneAndUpdate(filter, data, options)
        .populate("schoolId")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async delete(filter) {
    try {
      const result = await Ticket.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
