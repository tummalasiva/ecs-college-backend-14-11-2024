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

  static async updateSingleTerm(req) {
    try {
      let updateTerm = await academicCalenderQuery.updateOne(
        { "terms._id": req.params.id },
        { $set: { "terms.$": req.body } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Term updated successfully!",
        result: updateTerm,
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
        { $set: { admissionDates: req.body.admissionDates } },
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

  static async updateSingleFeePaymentDeadline(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { "feePaymentDeadlines._id": id },
        {
          $set: {
            "feePaymentDeadlines.$": req.body,
          },
        },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fee payment deadline updated successfully!",
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

  static async updateSingleEvent(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { "events._id": id },
        { $set: { "events.$": req.body } },
        { new: true }
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

  static async updateSingleCoCurricularActivity(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { "coCurricularActivities._id": id },
        {
          $set: {
            "coCurricularActivities.$": req.body,
          },
        },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Co-CurricularActivity updated successfully!",
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

  static async updateSinglePlacementActivity(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { "placementActivities._id": id },
        {
          $set: {
            "placementActivities.$": req.body,
          },
        },
        { new: true, upsert: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Placement activity updated successfully!",
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

  static async updateSingleProjectSubmissionDeadline(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { "projectSubmissionDeadlines._id": id },
        {
          $set: {
            "projectSubmissionDeadlines.$": req.body,
          },
        },
        { new: true, upsert: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Project Submission Deadline updated successfully!",
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

  static async updateSingleMeeting(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { "meetings._id": id },
        {
          $set: {
            "meetings.$": req.body,
          },
        },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Meeting updated successfully!",
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
        message: "Special Programs updated successfully!",
        result: updatedCalender,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateSingleSpecialProgram(req) {
    try {
      const { id } = req.params;
      const updatedCalender = await academicCalenderQuery.updateOne(
        { "specialPrograms._id": id },
        {
          $set: {
            "specialPrograms.$": req.body,
          },
        },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Special Program updated successfully!",
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
