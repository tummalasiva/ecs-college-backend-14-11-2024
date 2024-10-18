const coursePlanQuery = require("@db/coursePlan/queries");
const CoursePlan = require("@db/coursePlan/model");
const semesterQuery = require("@db/semester/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { default: mongoose } = require("mongoose");
const dayjs = require("dayjs");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class CoursePlanService {
  static async updatePlan(req) {
    try {
      const { planDescription } = req.body;

      let coursePlan = await coursePlanQuery.findOne({
        _id: req.params.id,
        facultyAssigned: req.employee,
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
      const { substituteEmployee, substituteReason } = req.body;
      let updatedCoursePlan = await coursePlanQuery.updateOne(
        { _id: req.params.id },
        { $set: { substituteEmployee, substituteReason } }
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
      const { coursePlanId } = req.query;
      const semester = await semesterQuery.findOne({ active: true });
      if (!semester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let coursePlanData = await coursePlanQuery.findOne({
        semester: semester._id,
        _id: coursePlanId,
        facultyAssigned: employee,
      });
      if (!coursePlanData)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      let coursePlan = await coursePlanQuery.findAll({
        semester: semester._id,
        subject: coursePlanData.subject?._id,
        section: coursePlanData.section?._id,
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

  static async mySubstitutePlan(req) {
    try {
      const employee = req.employee;
      const semester = await semesterQuery.findOne({ active: true });
      if (!semester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let coursePlan = await coursePlanQuery.findAll({
        semester: semester._id,
        substituteEmployee: employee,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: coursePlan,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getMyCoursePlanSubjects(req) {
    try {
      const employee = req.employee;
      const currentSemester = await semesterQuery.findOne({ active: true });
      if (!currentSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let filter = {
        facultyAssigned: mongoose.Types.ObjectId(employee),
        semester: currentSemester._id,
      };

      const coursePlans = await CoursePlan.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: "$subject", // Grouping by the subject field
            coursePlan: { $first: "$$ROOT" }, // Get the first document for each subject group
          },
        },
        {
          $replaceRoot: { newRoot: "$coursePlan" }, // Replace the root with the coursePlan object
        },
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $unwind: "$subject",
        },
        {
          $lookup: {
            from: "sections",
            localField: "section",
            foreignField: "_id",
            as: "section",
          },
        },
        {
          $unwind: "$section",
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: coursePlans,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getOthersCoursePlanSubjects(req) {
    try {
      const { faculty } = req.query;
      const currentSemester = await semesterQuery.findOne({ active: true });
      if (!currentSemester)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Active semester not found!",
          responseCode: "CLIENT_ERROR",
        });

      let filter = {
        facultyAssigned: mongoose.Types.ObjectId(faculty),
        semester: currentSemester._id,
      };

      const coursePlans = await CoursePlan.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: "$subject", // Grouping by the subject field
            coursePlan: { $first: "$$ROOT" }, // Get the first document for each subject group
          },
        },
        {
          $replaceRoot: { newRoot: "$coursePlan" }, // Replace the root with the coursePlan object
        },
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $unwind: "$subject",
        },
        {
          $lookup: {
            from: "sections",
            localField: "section",
            foreignField: "_id",
            as: "section",
          },
        },
        {
          $unwind: "$section",
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: coursePlans,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const activeSemester = await semesterQuery.findOne({ active: true });
      let coursePlan = await coursePlanQuery.findAll({
        ...search,
        semester: activeSemester._id,
      });
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

  static async getWeeklyCoursePlans(req) {
    const startOfWeek = dayjs().startOf("week").format("YYYY-MM-DD"); // Start of the current week
    const endOfWeek = dayjs().endOf("week").format("YYYY-MM-DD"); // End of the current week

    const semester = await semesterQuery.findOne({ active: true });
    if (!semester)
      return common.failureResponse({
        statusCode: httpStatusCode.not_found,
        message: "Active semester not found!",
        responseCode: "CLIENT_ERROR",
      });

    try {
      // Aggregation pipeline to filter and group course plans
      const weeklyPlans = await CoursePlan.aggregate([
        {
          // Match documents where the date part of plannedDate is within the current week's date range
          $match: {
            semester: semester._id,
            facultyAssigned: mongoose.Types.ObjectId(req.employee),
            $expr: {
              $and: [
                {
                  $gte: [
                    {
                      $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$plannedDate",
                      },
                    },
                    startOfWeek,
                  ],
                },
                {
                  $lte: [
                    {
                      $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$plannedDate",
                      },
                    },
                    endOfWeek,
                  ],
                },
              ],
            },
          },
        },
        {
          // Lookup to populate related fields from other collections
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $lookup: {
            from: "sections",
            localField: "section",
            foreignField: "_id",
            as: "section",
          },
        },
        {
          $lookup: {
            from: "slots",
            localField: "slots",
            foreignField: "_id",
            as: "slots",
          },
        },
        {
          $lookup: {
            from: "buildingrooms",
            localField: "room",
            foreignField: "_id",
            as: "room",
          },
        },
        {
          $lookup: {
            from: "buildings",
            localField: "building",
            foreignField: "_id",
            as: "building",
          },
        },
        {
          // Unwind the arrays from the lookups
          $unwind: { path: "$subject", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$section", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$room", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$building", preserveNullAndEmptyArrays: true },
        },
        {
          // Group by day, subject, section, room, building, and slot to eliminate duplicates
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$plannedDate" },
              },
              subject: "$subject._id",
              section: "$section._id",
              room: "$room._id",
              building: "$building._id",
              slot: "$slots",
            },
            coursePlan: {
              $first: {
                courseType: "$courseType",
                subject: "$subject.name",
                subjectCode: "$subject.subjectCode",
                year: "$year",
                section: "$section.name",
                slot: "$slots",
                room: "$room.roomNumber",
                building: "$building.name",
                day: "$day",
              },
            },
          },
        },
        {
          // Group by the date part of plannedDate and create an array of lectures for each date
          $group: {
            _id: "$_id.date",
            lectures: { $push: "$coursePlan" },
          },
        },
        {
          // Project the final output format
          $project: {
            _id: 0,
            date: "$_id",
            lectures: 1,
          },
        },
        {
          // Sort the results by date
          $sort: { date: 1 },
        },
      ]);

      // Return the aggregated result
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: weeklyPlans,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getDaysOfCoursePlan(req) {
    try {
      const { coursePlanId } = req.query;
      const coursePlan = await coursePlanQuery.findOne({ _id: coursePlanId });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      const { semester, courseType, subject, section, year, facultyAssigned } =
        coursePlan;

      let filter = {
        semester: semester._id,
        subject: subject._id,
        section: section._id,
        year: year,
        courseType: courseType,
        facultyAssigned: facultyAssigned?._id,
      };

      const dayOrder = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      const groupedCoursePlans = await CoursePlan.aggregate([
        {
          $match: filter,
        },
        {
          // Group by the day field
          $group: {
            _id: "$day",
            totalClasses: {
              $sum: 1,
            },
          },
        },

        {
          // Project the final output format
          $project: {
            _id: 0,
            day: "$_id",
            totalClasses: 1,
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: groupedCoursePlans,
      });
    } catch (error) {
      throw error;
    }
  }

  // course materials

  static async addCourseMaterial(req) {
    try {
      const { title, link, coursePlanId } = req.body;
      if (!req.files && !link?.trim())
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide either a file or a link!",
          responseCode: "CLIENT_ERROR",
        });
      let data = { title, link, file: "" };
      if (req.files && req.files?.file) {
        data.file = await uploadFileToS3(req.files.file);
      }

      let updatedCoursePlan = await coursePlanQuery.updateOne(
        {
          _id: coursePlanId,
          facultyAssigned: req.employee,
        },
        {
          $addToSet: { courseMaterials: data },
        }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course Material added successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async removeCourseMaterial(req) {
    try {
      const { materialId } = req.query;
      const { id } = req.params;

      let coursePlan = await coursePlanQuery.findOne({
        _id: id,
        facultyAssigned: req.employee,
      });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      let selectedCourseMaterial = coursePlan.courseMaterials?.find(
        (c) => c._id.toHexString() === materialId
      );
      if (!selectedCourseMaterial)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Material not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (selectedCourseMaterial.file) {
        await deleteFile(selectedCourseMaterial.file);
      }

      let updatedCoursePlan = await coursePlanQuery.updateOne(
        {
          _id: req.params.id,
          facultyAssigned: req.employee,
        },
        {
          $pull: { courseMaterials: { _id: materialId } },
        }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course Material removed successfully!",
      });
    } catch (error) {}
  }

  static async updateCourseMaterial(req) {
    try {
      const { link, materialId, title } = req.body;

      if (!link && !req.files)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide either a file or a link!",
          responseCode: "CLIENT_ERROR",
        });

      let coursePlan = await coursePlanQuery.findOne({
        "courseMaterails._id": materialId,
        facultyAssigned: req.employee,
      });
      if (!coursePlan)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Course Plan not found!",
          responseCode: "CLIENT_ERROR",
        });

      let material = coursePlan.courseMaterials?.find(
        (c) => c._id?.toHexString() === materialId
      );

      let data = {
        link,
        title,
        file: material.file,
      };
      if (req.files && req.files.file) {
        if (data.file) {
          await deleteFile(data.file);
        }

        data.file = await uploadFileToS3(req.files.file);
      }

      const updatedMaterial = await coursePlanQuery.updateOne(
        { "courseMaterials._id": materialId },
        { $set: { "courseMaterials.$": data } }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course Material updated successfully!",
      });
    } catch (error) {
      throw error;
    }
  }
};
