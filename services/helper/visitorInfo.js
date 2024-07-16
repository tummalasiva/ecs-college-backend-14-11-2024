const visitorInfoQuery = require("@db/visitorInfo/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");
const moment = require("moment");

module.exports = class VisitorInfoService {
  static async create(body) {
    try {
      const newInfo = await visitorInfoQuery.create(body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Visitor Info created successfully",
        result: newInfo,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      let visitorInfoList = await visitorInfoQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: visitorInfoList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { id } = req.params;
      const {
        name,
        phone,
        comingForm,
        roleName,
        toMeetUserType,
        toMeetUser,
        reasonToMeet,
        class: classId,
        section,
        checkIn,
        checkOut,
        note,
      } = req.body;

      console.log(
        checkOut,
        "checkOut================================================================"
      );
      if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Check-out time must be greater than check-in time",
          responseCode: "CLIENT_ERROR",
        });
      }
      const existingVisitorInfo = await visitorInfoQuery.findOne({ _id: id });

      if (!existingVisitorInfo) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "VisitorInfo not found",
          responseCode: "CLIENT_ERROR",
        });
      }
      if (
        existingVisitorInfo.checkOut &&
        moment(Date.now()).diff(
          new Date(existingVisitorInfo.checkOut),
          "minutes"
        ) > 30
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Cannot update check-out time after 30 minutes",
          responseCode: "CLIENT_ERROR",
        });
      }

      const updatedVisitorInfo = await visitorInfoQuery.updateOne(
        { _id: id },
        {
          name,
          phone,
          comingForm,
          roleName,
          toMeetUserType,
          toMeetUser,
          reasonToMeet,
          class: classId,
          section,
          checkOut,
          note,
        },
        { new: true }
      );

      if (!updatedVisitorInfo) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Visitor info not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "VisitorInfo updated successfully!",
        result: updatedVisitorInfo,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateCheckout(req) {
    try {
      const updatedCheckout = await visitorInfoQuery.updateOne(
        {
          _id: req.params.id,
        },
        { $set: { checkOut: Date.now() } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Visitor Info updated successfully!",
        result: updatedCheckout,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      await visitorInfoQuery.delete({
        _id: id,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Visitor Info deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let visitorInfo = await visitorInfoQuery.findOne({ _id: id });

      if (visitorInfo) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Visitor Info fetched successfully",
          result: visitorInfo,
        });
      } else {
        return common.failureResponse({
          message: "Failed to find the visitor info details",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
