const academicCalenderQuery = require("@db/academicCalender/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class AcademicCalenderService {
  static async updateTerms(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { academicYear: id },
        { $addToSet: { terms: { $each: req.body.terms } } },
        { new: true, upsert: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Terms updated successfully!",
        result: updatedCalender,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateAdmissionDates(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { academicYear: id },
        { $addToSet: { admissionDates: req.body.admissionDates } },
        { new: true, upsert: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Admission Date updated successfully!",
        result: updatedCalender,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateFeePaymentDeadlines(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { academicYear: id },
        {
          $addToSet: {
            feePaymentDeadlines: { $each: req.body.feePaymentDeadlines },
          },
        },
        { new: true, upsert: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fee payment deadlines updated successfully!",
        result: updatedCalender,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateEvents(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { academicYear: id },
        { $addToSet: { events: { $each: req.body.events } } },
        { new: true, upsert: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Events updated successfully!",
        result: updatedCalender,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateCoCurricularActivities(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { academicYear: id },
        {
          $addToSet: {
            coCurricularActivities: { $each: req.body.coCurricularActivities },
          },
        },
        { new: true, upsert: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Co-CurricularActivities updated successfully!",
        result: updatedCalender,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updatePlacementActivities(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { academicYear: id },
        {
          $addToSet: {
            placementActivities: { $each: req.body.placementActivities },
          },
        },
        { new: true, upsert: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Placement activities updated successfully!",
        result: updatedCalender,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateProjectSubmissionDeadlines(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { academicYear: id },
        {
          $addToSet: {
            projectSubmissionDeadlines: {
              $each: req.body.projectSubmissionDeadlines,
            },
          },
        },
        { new: true, upsert: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Project Submission Deadlines updated successfully!",
        result: updatedCalender,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateMeetings(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { academicYear: id },
        {
          $addToSet: {
            meetings: { $each: req.body.meetings },
          },
        },
        { new: true, upsert: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Meetings updated successfully!",
        result: updatedCalender,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateSpecialPrograms(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { academicYear: id },
        {
          $addToSet: {
            specialPrograms: { $each: req.body.specialPrograms },
          },
        },
        { new: true, upsert: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Special Programs successfully!",
        result: updatedCalender,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getDetails(req) {
    try {
      const academicCalender = await academicCalenderQuery.findOne({
        academicYear: req.params.id,
      });
      if (!academicCalender)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message:
            "Academic Calender not found for the selected academic year!",
          responseCode: "CLIENT_ERROR",
        });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Academic Calender Details",
        result: academicCalender,
      });
    } catch (error) {
      throw error;
    }
  }
};
