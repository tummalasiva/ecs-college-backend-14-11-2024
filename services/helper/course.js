const courseQuery = require("@db/course/queries");
const classQuery = require("@db/class/queries");
const subjectQuery = require("@db/subject/queries");
const courseContentQuery = require("@db/courseContent/queries");
const storageQuery = require("@db/storage/queries");
const Course = require("@db/course/model");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");
const { default: mongoose } = require("mongoose");

module.exports = class CourseService {
  static async create(req) {
    try {
      const data =
        typeof req.body.bodyData === "string"
          ? JSON.parse(req.body.bodyData)
          : req.body.bodyData;
      const {
        subject,
        description,
        isTrending,
        title,
        classIds,
        courseDetails,
      } = data;
      let bodyData = {};

      if (!Array.isArray(classIds))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please send list of classes!",
          responseCode: "CLIENT_ERROR",
        });

      if (classIds.length === 1 && !subject)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please select a subject",
          responseCode: "CLIENT_ERROR",
        });

      let classWithGivenIds = await classQuery.findAll({
        _id: { $in: classIds },
      });

      if (classWithGivenIds.length !== classIds.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "One or more that one of the mentioned classes was not found",
          responseCode: "CLIENT_ERROR",
        });

      let subjectWithTheGivenId = null;

      if (classIds.length === 1) {
        subjectWithTheGivenId = await subjectQuery.findOne({
          _id: mongoose.Types.ObjectId(subject),
        });

        if (!subjectWithTheGivenId)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Subject was not found!",
            responseCode: "CLIENT_ERROR",
          });
      }

      let courseFindFilter = {};
      if (classIds.length > 1) {
        courseFindFilter["title"] = { $regex: new RegExp(`^${title}`, "i") };
        courseFindFilter["class"] = { $in: classIds };
      } else {
        courseFindFilter["title"] = { $regex: new RegExp(`^${title}`, "i") };
        courseFindFilter["class"] = { $in: classIds };
        courseFindFilter["subject"] = subject;
      }

      let courseExists = await courseQuery.findOne(courseFindFilter);

      if (courseExists) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Course with the given name already exists for given class and subject!",
          responseCode: "CLIENT_ERROR",
        });
      }

      let file = req.files?.file;
      let thumbnailImage = "";
      if (file) {
        const link = await uploadFileToS3(file);
        thumbnailImage = link;
      }

      bodyData["class"] = classIds;
      if (classIds.length === 1) {
        bodyData["subject"] = subject;
      } else {
        bodyData["universalCourse"] = true;
      }
      bodyData["thumbnailImage"] = thumbnailImage;
      bodyData["title"] = title;
      bodyData["description"] = description;
      bodyData["isTrending"] = isTrending;
      bodyData["courseDetails"] = {};
      bodyData["school"] = req.schoolId;

      let overview = [];
      for (let o of courseDetails.overview) {
        if (o._id) {
          overview.push(o);
        } else {
          overview.push({ ...o, _id: new mongoose.Types.ObjectId() });
        }
      }

      let benefits = [];

      for (let b of courseDetails.benefits) {
        if (b._id) {
          benefits.push(b);
        } else {
          benefits.push({ ...b, _id: new mongoose.Types.ObjectId() });
        }
      }

      bodyData.courseDetails.overview = overview;
      bodyData.courseDetails.benefits = benefits;
      bodyData["createdBy"] = req.employee._id;
      let newCourse = await courseQuery.create(bodyData);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course created successfully!",
        result: newCourse,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      let { search = {} } = req.query;
      let parsedSearch =
        typeof search === "string" ? JSON.parse(search) : search;
      let filter = {};
      if (parsedSearch.classIds) {
        filter["class"] = {
          $size: parsedSearch.classIds.length,
          $all: parsedSearch.classIds,
        };
      }
      if (parsedSearch.subject === "Common") {
        filter["universalCourse"] = true;
      } else if (parsedSearch.subject && parsedSearch.subject !== "Common") {
        filter["subject"] = parsedSearch.subject;
      }
      const allCourses = await courseQuery.findAll({
        ...filter,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course list fetched successfully",
        result: allCourses,
      });
    } catch (error) {
      throw error;
    }
  }

  static async myCourses(req) {
    try {
      let { search = {} } = req.query;
      let parsedSearch =
        typeof search === "string" ? JSON.parse(search) : search;
      let student = req.student;

      let filter = {};
      if (parsedSearch.subject === "Common") {
        filter["universalCourse"] = true;
      } else if (parsedSearch.subject && parsedSearch.subject !== "Common") {
        filter["subject"] = parsedSearch.subject;
      }

      filter["class"] = { $in: [student.academicInfo.class._id] };

      let allMyCourses = await courseQuery.find(filter);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course list fetched successfully",
        result: allMyCourses,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const courseId = req.params.id;

      let bodyData = {};
      let courseWithTheGivenId = await courseQuery.findOne({ _id: courseId });

      if (!courseWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Course not found!",
          responseCode: "CLIENT_ERROR",
        });

      const data =
        typeof req.body.bodyData === "string"
          ? JSON.parse(req.body.bodyData)
          : req.body.bodyData;
      const { description, title, courseDetails, classIds, subject } = data;

      if (classIds.length === 1 && !subject)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please select a subject",
          responseCode: "CLIENT_ERROR",
        });

      let courseFindFilter = {};
      if (classIds.length > 1) {
        courseFindFilter["title"] = { $regex: new RegExp(`^${title}`, "i") };
        courseFindFilter["class"] = { $in: [courseWithTheGivenId.class._id] };
      } else {
        courseFindFilter["title"] = { $regex: new RegExp(`^${title}`, "i") };
        courseFindFilter["class"] = { $in: [courseWithTheGivenId.class._id] };
        courseFindFilter["subject"] = subject;
      }

      let courseWithGivenTitle = await courseQuery.findOne(courseFindFilter);
      if (
        courseWithGivenTitle &&
        courseWithGivenTitle._id.toHexString() !==
          courseWithTheGivenId._id.toHexString()
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Course with the given name already exists for the given class and subject!",
          responseCode: "CLIENT_ERROR",
        });

      let file = req.files?.file;

      if (file) {
        if (courseWithTheGivenId.thumbnailImage) {
          await deleteFile(courseWithTheGivenId.thumbnailImage);
        }

        const link = await uploadFileToS3(req.files.file);

        bodyData["thumbnailImage"] = link;
        bodyData["title"] = title;
        bodyData["description"] = description;
        bodyData["courseDetails"] = {};
        bodyData["class"] = classIds;
        if (classIds.length === 1) {
          bodyData["subject"] = subject;
          bodyData["universalCourse"] = false;
        } else {
          bodyData["universalCourse"] = true;
          bodyData["subject"] = null;
        }

        let overview = [];
        for (let o of courseDetails.overview) {
          if (o._id) {
            overview.push(o);
          } else {
            overview.push({ ...o, _id: new mongoose.Types.ObjectId() });
          }
        }

        let benefits = [];

        for (let b of courseDetails.benefits) {
          if (b._id) {
            benefits.push(b);
          } else {
            benefits.push({ ...b, _id: new mongoose.Types.ObjectId() });
          }
        }

        bodyData.courseDetails.overview = overview;
        bodyData.courseDetails.benefits = benefits;
        bodyData["updatedBy"] = req.employee._id;

        let updatedCourse = await courseQuery.updateOne(
          { _id: courseId },
          bodyData,
          {
            new: true,
          }
        );

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Course updated successfully!",
          result: updatedCourse,
        });
      } else {
        bodyData["thumbnailImage"] = courseWithTheGivenId.thumbnailImage;
        bodyData["title"] = title;
        bodyData["description"] = description;
        bodyData["courseDetails"] = {};
        bodyData["class"] = classIds;
        if (classIds.length === 1) {
          bodyData["subject"] = subject;
          bodyData["universalCourse"] = false;
        } else {
          bodyData["universalCourse"] = true;
          bodyData["subject"] = null;
        }

        let overview = [];
        for (let o of courseDetails.overview) {
          if (o._id) {
            overview.push(o);
          } else {
            overview.push({ ...o, _id: new mongoose.Types.ObjectId() });
          }
        }

        let benefits = [];

        for (let b of courseDetails.benefits) {
          if (b._id) {
            benefits.push(b);
          } else {
            benefits.push({ ...b, _id: new mongoose.Types.ObjectId() });
          }
        }

        bodyData.courseDetails.overview = overview;
        bodyData.courseDetails.benefits = benefits;
        bodyData["updatedBy"] = req.employee._id;

        let updatedCourse = await courseQuery.updateOne(
          { _id: courseId },
          bodyData,
          {
            new: true,
          }
        );

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Course updated successfully!",
          result: updatedCourse,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const courseId = req.params.id;

      let courseToDelete = await courseQuery.findOne({ _id: courseId });
      if (!courseToDelete)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Course not found!",
          responseCode: "CLIENT_ERROR",
        });

      let courseContent = await courseContentQuery.findOne({
        courseId: courseId,
      });
      if (courseContent) {
        let chapters = courseContent.chapters;
        if (chapters.length > 0) {
          for (let chapter of chapters) {
            if (chapter.material) {
              await deleteFile(chapter.material);
            }
            if (chapter.contents.length) {
              for (let materialToDelete of chapter.contents) {
                if (materialToDelete.type === "FlashCard") {
                  if (materialToDelete.flashCard.cardType === "Image") {
                    await deleteFile(materialToDelete.flashCard.image);
                  }
                } else if (materialToDelete.type === "Video") {
                  await deleteFile(materialToDelete.video);
                } else if (materialToDelete.type === "Material") {
                  await deleteFile(materialToDelete.contentMaterial);
                }
              }
            }
          }
        }

        await courseContentQuery.delete({ courseId: courseId });
      }

      await courseQuery.delete({ _id: courseId });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Course deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async uploadCourseMaterial(req) {
    try {
      const id = req.params.id;
      const courseWithTheGivenId = await courseQuery.findOne({ _id: id });
      let file = req.files?.file;
      let material = "";

      if (file) {
        if (courseWithTheGivenId.material) {
          await deleteFile(courseWithTheGivenId.material);
        }

        const link = await uploadFileToS3(req.files.file);

        material = link;
      }

      const uploadMaterial = await courseQuery.updateOne(
        { _id: req.params.id },
        { $set: { material: material } },
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Material uploaded successfully!",
        result: uploadMaterial,
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteCourseMaterial(req) {
    try {
      const id = req.params.id;

      const courseWithTheGivenId = await courseQuery.findOne({
        _id: id,
      });

      if (courseWithTheGivenId.material) {
        await deleteFile(courseWithTheGivenId.material);
      }

      const uploadMaterial = await courseQuery.updateOne(
        { _id: id },
        { $set: { material: null } },
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Material deleted successfully!",
        result: uploadMaterial,
      });
    } catch (error) {
      throw error;
    }
  }
};
