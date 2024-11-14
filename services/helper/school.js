const schoolQuery = require("@db/school/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const Semester = require("@db/semester/model");
const { uploadFileToS3, deleteFile } = require("../../helper/helpers");

module.exports = class SchoolService {
  static async create(body, files) {
    try {
      let logo = "";

      if (files && files.logo) {
        logo = await uploadFileToS3(files.logo);
      }

      body.logo = logo;

      const schools = await schoolQuery.create(body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "School created successfully",
        result: schools,
      });
    } catch (error) {
      return error;
    }
  }

  static async update(id, body, files) {
    try {
      let schoolWithGivenId = await schoolQuery.findOne({ _id: id });
      if (!schoolWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "School not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (!body.academicSemester1 || !body.academicSemester1?.name)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Academic semester 1 is required and should have a name!",
          responseCode: "CLIENT_ERROR",
        });

      if (!body.academicSemester2 || !body.academicSemester2.name)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Academic semester 2 is required and should have a name!",
          responseCode: "CLIENT_ERROR",
        });

      if (
        body.academicSemester1?.name !==
        schoolWithGivenId?.academicSemester1?.name
      ) {
        await Semester.updateMany(
          { semesterName: schoolWithGivenId?.academicSemester1?.name },
          { $set: { semesterName: body.academicSemester1?.name } }
        );
      }

      if (
        body.academicSemester2?.name !==
        schoolWithGivenId?.academicSemester2?.name
      ) {
        await Semester.updateMany(
          { semesterName: schoolWithGivenId?.academicSemester2?.name },
          { $set: { semesterName: body.academicSemester2?.name } }
        );
      }

      let logo = schoolWithGivenId.logo;

      if (files && files.logo) {
        if (logo) {
          await deleteFile(logo);
        }
        logo = await uploadFileToS3(files.logo);
      }

      body.logo = logo;

      const schools = await schoolQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "School updated successfully",
        result: schools,
      });
    } catch (error) {
      return error;
    }
  }

  static async toggleActiveStatus(id) {
    try {
      let school = await schoolQuery.updateOne(
        { _id: id },
        [{ $set: { active: { $eq: ["$active", false] } } }],
        {
          new: true,
        }
      );
      if (school) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: school.active
            ? "School activated successfully!"
            : "School deactivated successfully!",
          result: school,
        });
      } else {
        return common.failureResponse({
          message: "School not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async listPublic(req) {
    const { search = {} } = req.query;
    try {
      const schools = await schoolQuery.findAll({ ...search, active: true });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: schools,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      const school = await schoolQuery.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: school,
      });
    } catch (error) {
      return error;
    }
  }

  static async details(id) {
    try {
      const school = await schoolQuery.findOne({ _id: id });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: school,
      });
    } catch (error) {
      return error;
    }
  }

  static async addFiles(req) {
    try {
      const id = req.params.id;
      let files = req.files;

      let instituteWithGivenId = await schoolQuery.findOne({
        _id: id,
      });
      if (!instituteWithGivenId)
        return common.failureResponse({
          message: "Institute not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let itemFiles = [...instituteWithGivenId.bannerImages];

      if (files) {
        if (Array.isArray(files["bannerImages"])) {
          for (let file of files["bannerImages"]) {
            let fileLink = await uploadFileToS3(file);
            itemFiles.push(fileLink);
          }
        } else {
          let fileLink = await uploadFileToS3(files["bannerImages"]);
          itemFiles.push(fileLink);
        }
      }
      let updatedSchool = await schoolQuery.updateOne(
        { _id: id },
        { $set: { bannerImages: itemFiles } },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.accepted,
        message: "Banner images added successfully",
        result: updatedSchool,
      });
    } catch (error) {
      throw error;
    }
  }

  static async removeFile(req) {
    try {
      const id = req.params.id;
      const { file } = req.body;

      let instituteWithGivenId = await schoolQuery.findOne({
        _id: id,
      });
      if (!instituteWithGivenId)
        return common.failureResponse({
          message: "Instititute not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let fileWithGivenId = instituteWithGivenId.bannerImages.find(
        (f) => f === file
      );
      if (!fileWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "File not found!",
          responseCode: "CLIENT_ERROR",
        });

      await deleteFile(file);

      let itemFiles = [
        ...instituteWithGivenId.bannerImages.filter((i) => i !== file),
      ];

      let updatedSchool = await schoolQuery.updateOne(
        { _id: id },
        { $set: { bannerImages: itemFiles } },
        { new: true }
      );
      return common.successResponse({
        statusCode: httpStatusCode.accepted,
        message: "Banner imgae removed successfully",
        result: updatedSchool,
      });
    } catch (error) {
      throw error;
    }
  }
};
