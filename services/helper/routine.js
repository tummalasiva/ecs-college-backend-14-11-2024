const httpStatusCategory = require("@generics/http-status");
const common = require("@constants/common");
const routineQuery = require("@db/routine/queries");
const classQuery = require("@db/class/queries");
const sectionQuery = require("@db/section/queries");
const employeeQuery = require("@db/employee/queries");
const subjectQuery = require("@db/subject/queries");
const schoolQuery = require("@db/school/queries");
const { notFoundError } = require("../../helper/helpers");

module.exports = class RoutineService {
  static async create(req) {
    const {
      classId,
      sectionId,
      subjectId,
      teacherId,
      startTime,
      endTime,
      day,
    } = req.body;
    console.log(req.body, "body");
    const school = req.schoolId;
    try {
      const [classData, sectionData, subjectData, employeeData, schoolData] =
        await Promise.all([
          classQuery.findOne({ _id: classId, school }),
          sectionQuery.findOne({ _id: sectionId, class: classId, school }),
          subjectQuery.findOne({ _id: subjectId, class: classId, school }),
          employeeQuery.findOne({ _id: teacherId, school }),
          schoolQuery.findOne({ _id: school }),
        ]);

      if (!classData) return notFoundError("Class not found!");
      if (!sectionData) return notFoundError("Section not found!");
      if (!subjectData) return notFoundError("Subject not found!");
      if (!employeeData) return notFoundError("Teacher not found!");
      if (!schoolData) return notFoundError("School not found!");

      let rotineExistsForGivenCredentials = await routineQuery.findOne({
        class: classId,
        section: sectionId,
        subject: subjectId,
        school: schoolData._id,
        startTime,
        endTime,
        teacher: employeeData._id,
        day,
      });

      if (rotineExistsForGivenCredentials)
        return common.failureResponse({
          statusCode: httpStatusCategory.bad_request,
          message:
            "Routine for the given class, section, subject, teacher, start time and end time already exists!",
          responseCode: "CLIENT_ERROR",
        });

      await routineQuery.create({
        class: classId,
        section: sectionId,
        subject: subjectId,
        teacher: teacherId,
        startTime,
        endTime,
        day,
        school,
      });

      return common.successResponse({
        statusCode: httpStatusCategory.ok,
        message: "Routine created successfully!",
        responseCode: "CLIENT_SUCCESS",
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search, school: req.schoolId };

      let routines = await routineQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCategory.ok,
        result: routines,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await routineQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCategory.ok,
        message: "Routine deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const rotineId = req.params.id;
      let updatedRoutine = await routineQuery.updateOne(
        { _id: rotineId },
        { $set: req.body }
      );
      return common.successResponse({
        statusCode: httpStatusCategory.ok,
        message: "Routine updated successfully!",
        result: updatedRoutine,
      });
    } catch (error) {
      throw error;
    }
  }
};
