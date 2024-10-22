const academicCalenderHelper = require("@services/helper/academicCalender");

module.exports = class AcademicCalenderController {
  async updateTerms(req) {
    try {
      const result = await academicCalenderHelper.updateTerms(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateAdmissionDates(req) {
    try {
      const result = await academicCalenderHelper.updateAdmissionDates(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateFeePaymentDeadlines(req) {
    try {
      const result = await academicCalenderHelper.updateFeePaymentDeadlines(
        req
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateEvents(req) {
    try {
      const result = await academicCalenderHelper.updateEvents(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateCoCurricularActivities(req) {
    try {
      const result = await academicCalenderHelper.updateCoCurricularActivities(
        req
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async updatePlacementActivities(req) {
    try {
      const result = await academicCalenderHelper.updatePlacementActivities(
        req
      );
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateProjectSubmissionDeadlines(req) {
    try {
      const result =
        await academicCalenderHelper.updateProjectSubmissionDeadlines(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateMeetings(req) {
    try {
      const result = await academicCalenderHelper.updateMeetings(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateSpecialPrograms(req) {
    try {
      const result = await academicCalenderHelper.updateSpecialPrograms(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getDetails(req) {
    try {
      const result = await academicCalenderHelper.getDetails(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
