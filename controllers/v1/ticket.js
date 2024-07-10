const ticketService = require("@services/helper/ticket");

module.exports = class TicketController {
  async create(req) {
    try {
      const result = await ticketService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await ticketService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await ticketService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
