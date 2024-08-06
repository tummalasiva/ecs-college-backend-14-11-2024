const calenderEventQuery = require("@db/calenderEvent/queries");
const common = require("@constants/common");
const httpStatusCode = require("@generics/http-status");
const { stripTimeFromDate } = require("../../helper/helpers");

module.exports = class CalenderEventHelper {
  static async create(req) {
    try {
      const { date, startTime, endTime, name } = req.body;

      // Validate the date, startTime, and endTime
      const validateDate = (date) =>
        new Date(date) instanceof Date && !isNaN(date);
      if (![new Date(date)].every(validateDate)) {
        return common.failureResponse({
          message: "Invalid date format",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      // Prepare the new event data
      const newEvent = {
        name,
        startTime: startTime,
        endTime: endTime,
      };

      // Update or create the calendar event
      await calenderEventQuery.updateOne(
        {
          date: stripTimeFromDate(new Date(date)),
          school: req.schoolId,
        },
        {
          $addToSet: { events: newEvent },
        },
        {
          upsert: true,
        }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Event created successfully",
      });
    } catch (error) {
      console.error("Error creating event:", error); // Log the error for debugging
      return common.failureResponse({
        message: "Internal server error",
        statusCode: httpStatusCode.internal_server_error,
        responseCode: "SERVER_ERROR",
      });
    }
  }

  static async update(req) {
    console.log(req.body, "0000000000088888");
    try {
      const eventId = req.params.id;

      const { startTime, endTime, name } = req.body;

      const updatedEvent = await calenderEventQuery.updateOne(
        {
          "events._id": eventId,
        },
        {
          $set: {
            "events.$.name": name,
            "events.$.startTime": startTime,
            "events.$.endTime": endTime,
          },
        }
      );

      if (!updatedEvent)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Event not found",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Event updated successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { filter = {} } = req.query;

      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }

      const calenderEvents = await calenderEventQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: calenderEvents,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const eventExists = await calenderEventQuery.findOne({
        "events._id": req.params.id,
      });
      if (!eventExists) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Event not found",
          responseCode: "CLIENT_ERROR",
        });
      }

      let updatedEvent = await calenderEventQuery.updateOne(
        { _id: eventExists._id },
        { $pull: { events: { _id: req.params.id } } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Event deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteCalenderEvent(req) {
    try {
      const eventId = req.params.id;
      const updatedEvent = await calenderEventQuery.delete({ _id: eventId });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Calender Event deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
