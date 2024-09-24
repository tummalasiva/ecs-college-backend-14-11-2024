const slotQuery = require("@db/slot/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class SlotService {
  static async create(req) {
    const { type, startTime, endTime, description } = req.body;
    try {
      const newSlot = await slotQuery.create(req.body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Slot created successfully!",
        result: newSlot,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;

      const slots = await slotQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Slots fetched successfully",
        result: slots,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { id, body } = req;

      const slots = await slotQuery.updateOne({ _id: id }, body);

      if (slots) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Slot updated successfully!",
          result: slots,
        });
      } else {
        return common.failureResponse({
          message: "Slot not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const { id } = req;

      const slots = await slotQuery.deleteOne({ _id: id });

      if (slots) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Slot deleted successfully!",
          result: slots,
        });
      } else {
        return common.failureResponse({
          message: "Slot not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
