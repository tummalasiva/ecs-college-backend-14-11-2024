const coursePlanQuery = require("@db/coursePlan/queries");
const semesterQuery = require("@db/semester/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class CoursePlanService {
  static async updatePlan(req) {
    try {
      const { planDescription } = req.body;

      const formattedDate = new Date(Date.now()).toISOString().split("T")[0];

      let coursePlan = await coursePlanQuery.findOne({
        _id: req.params.id,
        facultyAssigned: req.employee,
        $expr: {
          $eq: [
            { $dateToString: { format: "%Y-%m-%d", date: "$plannedDate" } },
            formattedDate,
          ],
        },
      });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      const updatedCoursePlan = await coursePlanQuery.updateOne(
        { _id: req.params.id },
        { $set: { planDescription } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course Plan updated successfully!",
        result: updatedCoursePlan,
      });
    } catch (error) {
      throw error;
    }
  }
  static async updateStatus(req) {
    try {
      const { updateDescription } = req.body;

      const formattedDate = new Date(Date.now()).toISOString().split("T")[0];

      let coursePlan = await coursePlanQuery.findOne({
        _id: req.params.id,
        facultyAssigned: req.employee,
        $expr: {
          $eq: [
            { $dateToString: { format: "%Y-%m-%d", date: "$plannedDate" } },
            formattedDate,
          ],
        },
      });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      const updatedCoursePlan = await coursePlanQuery.updateOne(
        { _id: req.params.id },
        { $set: { executedDate: new Date(), updateDescription } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course Plan status updated successfully!",
        result: updatedCoursePlan,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateFaculty(req) {
    try {
      const { faculty } = req.body;
      let updatedCoursePlan = await coursePlanQuery.updateOne(
        { _id: req.params.id },
        { $set: { facultyAssigned: faculty } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course Plan faculty updated successfully!",
        result: updatedCoursePlan,
      });
    } catch (error) {
      throw error;
    }
  }

  static async myCoursePlan(req) {
    try {
      const employee = req.employee;
      const { subject, section } = req.query;
      const semester = await semesterQuery.findOne({ active: true });
      if (!semester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let coursePlan = await coursePlanQuery.findAll({
        semester: semester._id,
        subject,
        section,
        facultyAssigned: employee,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: coursePlan,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let coursePlan = await coursePlanQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: coursePlan,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      let coursePlan = await coursePlanQuery.findOneAndDelete({
        _id: req.params.id,
      });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Plan not found!",
          responseCode: "CLIENT_ERROR",
        });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course Plan deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
