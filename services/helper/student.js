const studentQuery = require("@db/student/queries");
const Student = require("@db/student/model");
const academicYearQuery = require("@db/academicYear/queries");
const classQuery = require("@db/class/queries");
const sectionQuery = require("@db/section/queries");
const schoolQuery = require("@db/school/queries");
const hostelQuery = require("@db/hostel/queries");
const roomQuery = require("@db/room/queries");
const stopQuery = require("@db/transport/stop/queries");
const routeQuery = require("@db/transport/route/queries");
const moment = require("moment");

const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const ExcelJS = require("exceljs");
const {
  uploadFileToS3,
  deleteFile,
  notFoundError,
  compileTemplate,
} = require("../../helper/helpers");

//

const fs = require("fs");
const path = require("path");

const xlsx = require("xlsx");
const mime = require("mime-types");
const puppeteer = require("puppeteer");
const { default: mongoose } = require("mongoose");

const extractHyperlinkText = (cellValue) => {
  if (typeof cellValue === "string" && cellValue.includes("http")) {
    const matches = cellValue.match(/"(.*?)"/);
    return matches ? matches[1] : cellValue;
  }
  return null;
};

const randomNumberRange = (min, max) => {
  const random = Math.random();
  return Math.floor(random * (max - min) + min);
};

const sortStudents = (students, sortBy) => {
  if (sortBy === "gender") {
    return students.sort((a, b) => {
      if (a.basicInfo.gender === b.basicInfo.gender) {
        return a.basicInfo.name.localeCompare(b.basicInfo.name);
      }
      return a.basicInfo.gender.localeCompare(b.basicInfo.gender);
    });
  } else {
    return students.sort((a, b) =>
      a.basicInfo.name.localeCompare(b.basicInfo.name)
    );
  }
};

function convertHeaderToMongoKey(header) {
  // Define mappings based on the provided structure
  const mappings = {
    basicInfo_name: "basicInfo.name",
    basicInfo_gender: "basicInfo.gender",
    basicInfo_bloodGroup: "basicInfo.bloodGroup",
    basicInfo_religion: "basicInfo.religion",
    basicInfo_rte: "basicInfo.rte",
    basicInfo_caste: "basicInfo.caste",
    basicInfo_cicn: "basicInfo.cicn",
    basicInfo_motherTongue: "basicInfo.motherTongue",
    basicInfo_birthPlace: "basicInfo.birthPlace",
    basicInfo_aadharNo: "basicInfo.aadharNo",
    basicInfo_satNo: "basicInfo.satNo",
    basicInfo_grNo: "basicInfo.grNo",
    contactInfo_guardianName: "contactInfo.guardianName",
    contactInfo_guardianContactNumber: "contactInfo.guardianContactNumber",
    contactInfo_guardianContactNumberSecondary:
      "contactInfo.guardianContactNumberSecondary",
    contactInfo_guardianRelation: "contactInfo.guardianRelation",
    contactInfo_nationId: "contactInfo.nationId",
    contactInfo_presentAddress: "contactInfo.presentAddress",
    contactInfo_permanentAddress: "contactInfo.permanentAddress",
    prevSchInfo_name: "prevSchInfo.name",
    prevSchInfo_tcNo: "prevSchInfo.tcNo",
    prevSchInfo_prevClass: "prevSchInfo.prevClass",
    prevSchInfo_transferCertificate: "prevSchInfo.transferCertificate",
    fatherInfo_name: "fatherInfo.name",
    fatherInfo_contactNumber: "fatherInfo.contactNumber",
    fatherInfo_education: "fatherInfo.education",
    fatherInfo_profession: "fatherInfo.profession",
    fatherInfo_designation: "fatherInfo.designation",
    fatherInfo_photo: "fatherInfo.photo",
    motherInfo_name: "motherInfo.name",
    motherInfo_contactNumber: "motherInfo.contactNumber",
    motherInfo_education: "motherInfo.education",
    motherInfo_profession: "motherInfo.profession",
    motherInfo_designation: "motherInfo.designation",
    motherInfo_photo: "motherInfo.photo",
    otherInfo_email: "otherInfo.email",
    otherInfo_username: "otherInfo.username",
    otherInfo_healthCondition: "otherInfo.healthCondition",
    otherInfo_extraInfo: "otherInfo.extraInfo",
    otherInfo_hostelMember: "otherInfo.hostelMember",
    otherInfo_transportMember: "otherInfo.transportMember",
    otherInfo_busStop: "otherInfo.busStop",
    otherInfo_libraryMember: "otherInfo.libraryMember",
    academicInfo_rollNumber: "academicInfo.rollNumber",
    academicInfo_admissionNumber: "academicInfo.admissionNumber",
    photo: "photo",
    contactNumber: "contactNumber",
    active: "active",
    username: "username",
    _id: "_id",
  };

  // Return the mapped MongoDB key if found in mappings
  return mappings[header] || null;
}

function convertHeaderToMongoKeyBulkAdmit(header) {
  const mappings = {
    Name: "basicInfo.name",
    "Admission Number": "basicInfo.admissionNumber",
    "Admission Date": "basicInfo.admissionDate",
    "Date of Birth": "basicInfo.dob",
    Gender: "basicInfo.gender",
    "Contact Number": "contactNumber",
    "Blood Group": "basicInfo.bloodGroup",
    Relation: "basicInfo.relation",
    RTE: "basicInfo.rte",
    Caste: "basicInfo.caste",
    Cicn: "basicInfo.cicn",
    "Mother Tongue": "basicInfo.motherTongue",
    "Birth Place": "basicInfo.birthPlace",
    "Aadhar Number": "basicInfo.aadharNo",
    "Guardian Name": "contactInfo.guardianName",
    "Guardian Relation": "contactInfo.guardianRelation",
    "Father Name": "fatherInfo.name",
    "Father Education": "fatherInfo.education",
    "Father Profession": "fatherInfo.profession",
    "Father Designation": "fatherInfo.designation",
    "Mother Name": "motherInfo.name",
    "Mother Education": "motherInfo.education",
    "Mother Profession": "motherInfo.profession",
    "Mother Designation": "motherInfo.designation",
    Email: "otherInfo.email",
    "Health Condition": "otherInfo.healthCondition",
    "Extra Info": "otherInfo.extraInfo",
    "Present Address": "contactInfo.presentAddress",
    "Permanent Address": "contactInfo.permanentAddress",
    "Previous School Name": "prevSchInfo.name",
    "TC Number": "prevSchInfo.tcNo",
    "Hostel Member": "otherInfo.hostelMember",
    "Transport Member": "otherInfo.transportMember",
    "Library Member": "otherInfo.libraryMember",
    "Bus Stop": "otherInfo.busStop",
    "Admission Number": "academicInfo.admissionNumber",
    "Roll Number": "academicInfo.rollNumber",
  };

  return mappings[header] || header;
}

const flattenObject = (obj, parent = "", res = {}) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const propName = parent ? `${parent}_${key}` : key;

      // Ensure the main document _id is not nested
      if (key === "_id" && !parent) {
        res["_id"] = obj[key]?.toString();
      } else if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        flattenObject(obj[key], propName, res);
      } else {
        res[propName] = obj[key];
      }
    }
  }
  return res;
};

module.exports = class StudentService {
  static async create(body, files) {
    try {
      let studentPhoto = "";
      let fatherPhoto = "";
      let motherPhoto = "";
      let transferCertificate = "";

      if (files) {
        if (files.studentPhoto) {
          studentPhoto = await uploadFileToS3(files.studentPhoto);
        }
        if (files.fatherPhoto) {
          fatherPhoto = await uploadFileToS3(files.fatherPhoto);
        }
        if (files.motherPhoto) {
          motherPhoto = await uploadFileToS3(files.motherPhoto);
        }
        if (files.transferCertificate) {
          transferCertificate = await uploadFileToS3(files.transferCertificate);
        }
      }

      let academicYearExists = await academicYearQuery.findOne({
        _id: body.academicYear,
      });
      if (!academicYearExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Selected academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      let classExists = await classQuery.findOne({
        _id: body.academicInfo?.class,
      });
      if (!classExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Selected class not found!",
          responseCode: "CLIENT_ERROR",
        });

      let sectionExists = await sectionQuery.findOne({
        _id: body.academicInfo?.section,
        class: body.academicInfo?.class,
      });
      if (!sectionExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Selected section not found!",
          responseCode: "CLIENT_ERROR",
        });

      body.academicInfo.fallbackClass = classExists;
      body.academicInfo.fallbackSection = sectionExists;

      body.username = `ecs_${randomNumberRange(10000000, 99999999)}`;
      body.password = body.contactNumber;

      body.photo = studentPhoto;
      body.fatherInfo.photo = fatherPhoto;
      body.motherInfo.photo = motherPhoto;
      if (body.prevSchInfo) {
        body.prevSchInfo.transferCertificate = transferCertificate;
      }
      let interestedSchool = await schoolQuery.findOne({ school: body.school });

      let admissionNumber = 0;

      if (
        interestedSchool.admissionNo === "manual" &&
        !body.academicInfo?.admissionNumber
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_req,
          message: "Admission number is required",
          responseCode: "CLIENT_ERROR",
        });

      if (interestedSchool.admissionNo !== "manual") {
        admissionNumber = interestedSchool.latestStudentAdmissionNumber
          ? interestedSchool.latestStudentAdmissionNumber + 1
          : 1;

        await schoolQuery.updateOne({
          _id: body.school,
          latestStudentAdmissionNumber: admissionNumber,
        });
      } else {
        admissionNumber = body.academicInfo?.admissionNumber;
      }

      body.academicInfo.admissionNumber = admissionNumber;

      if (
        interestedSchool.rollNumberType === "manual" &&
        !body.academicInfo?.rollNumber
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_req,
          message: "Roll number is required",
          responseCode: "CLIENT_ERROR",
        });

      body.academicInfo.admissionNumber = admissionNumber;
      body.registrationYear = academicYearExists._id;
      let student = await studentQuery.create(body);

      if (interestedSchool.rollNumberType !== "manual") {
        if (interestedSchool.rollNumberType === "autoAscendingName") {
          const students = await Student.find({
            "academicInfo.class": body.academicInfo.class,
            "academicInfo.section": body.academicInfo.section,
          }).sort({ "basicInfo.name": 1 });

          // Step 3: Update roll numbers
          for (let i = 0; i < students.length; i++) {
            students[i].academicInfo.rollNumber = i + 1;
            await students[i].save();
          }
        } else {
          const students = await Student.find({
            "academicInfo.class": body.academicInfo.class,
            "academicInfo.section": body.academicInfo.section,
          }).sort({
            "basicInfo.gender": 1,
            "basicInfo.name": 1,
          });

          for (let i = 0; i < students.length; i++) {
            students[i].academicInfo.rollNumber = i + 1;
            await students[i].save();
          }
        }
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student added successfully",
        result: student,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };
      const activeAcademicYear = await academicYearQuery.findOne({
        active: true,
      });

      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }

      filter["academicYear"] = activeAcademicYear._id;
      if (typeof filter.active === "undefined") {
        filter["active"] = true;
      }

      let students = await studentQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: students,
        message: "Students fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId, files) {
    try {
      let studentWithGivenId = await studentQuery.findOne({ _id: id });
      if (!studentWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student not found!",
          responseCode: "CLIENT_ERROR",
        });

      let academicYearExists = await academicYearQuery.findOne({
        _id: body.academicYear,
      });
      if (!academicYearExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Selected academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      let classExists = await classQuery.findOne({
        _id: body.academicInfo.class,
      });
      if (!classExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Selected class not found!",
          responseCode: "CLIENT_ERROR",
        });

      let sectionExists = await sectionQuery.findOne({
        _id: body.academicInfo.section,
        class: body.academicInfo.class,
      });
      if (!sectionExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Selected section not found!",
          responseCode: "CLIENT_ERROR",
        });

      let studentPhoto = studentWithGivenId.photo;
      let fatherPhoto = studentWithGivenId.fatherInfo?.photo;
      let motherPhoto = studentWithGivenId.motherInfo?.photo;
      let transferCertificate =
        studentWithGivenId.prevSchInfo?.transferCertificate;

      if (files) {
        if (files.studentPhoto) {
          if (studentPhoto) {
            await deleteFile(studentPhoto);
          }
          studentPhoto = await uploadFileToS3(files.studentPhoto);
        }
        if (files.fatherPhoto) {
          if (fatherPhoto) {
            await deleteFile(fatherPhoto);
          }
          fatherPhoto = await uploadFileToS3(files.fatherPhoto);
        }
        if (files.motherPhoto) {
          if (motherPhoto) {
            await deleteFile(motherPhoto);
          }
          motherPhoto = await uploadFileToS3(files.motherPhoto);
        }
        if (files.transferCertificate) {
          if (transferCertificate) {
            await deleteFile(transferCertificate);
          }
          transferCertificate = await uploadFileToS3(files.transferCertificate);
        }
      }

      body.academicInfo.fallbackClass = classExists;
      body.academicInfo.fallbackSection = sectionExists;

      body.photo = studentPhoto;
      body.fatherInfo.photo = fatherPhoto;
      body.motherInfo.photo = motherPhoto;
      body.prevSchInfo.transferCertificate = transferCertificate;

      let student = await studentQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (student) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Student updated successfully!",
          result: student,
        });
      } else {
        return common.failureResponse({
          message: "Student not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let studentWithGivenId = await studentQuery.findOne({ _id: id });
      if (!studentWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Student not found!",
          responseCode: "CLIENT_ERROR",
        });
      if (studentWithGivenId.photo) {
        await deleteFile(studentWithGivenId.photo);
      }
      let student = await studentQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student deleted successfully!",
        result: student,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let student = await studentQuery.findOne({ _id: id });
      if (student) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Student fetched successfully!",
          result: student,
        });
      } else {
        return common.failureResponse({
          message: "Student not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async overView(req) {
    try {
      const { academicYear } = req.query;
      const academicYearExists = await academicYearQuery.findOne({
        _id: academicYear,
      });
      if (!academicYearExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Academic Year not found!",
          responseCode: "CLIENT_ERROR",
        });

      const totalStudentsCount = await Student.count({
        academicYear: academicYearExists._id,
        school: req.schoolId,
        active: true,
      }).lean();

      const totalMaleStudentsCount = await Student.count({
        academicYear: academicYearExists._id,
        school: req.schoolId,
        "basicInfo.gender": "male",
        active: true,
      }).lean();

      const totalFemaleStudentsCount = await Student.count({
        academicYear: academicYearExists._id,
        school: req.schoolId,
        "basicInfo.gender": "female",
        active: true,
      }).lean();

      const overview = [];
      const classes = await classQuery.findAll({
        school: req.schoolId,
      });
      for (const schoolClass of classes) {
        let info = {};
        info.name = schoolClass.name;

        const studentCount = await Student.count({
          school: req.schoolId,
          "academicInfo.class": schoolClass._id,
          academicYear: academicYear,
          active: true,
        }).lean();

        info.totalStudents = studentCount;

        const studentMaleCount = await Student.count({
          school: req.schoolId,
          "academicInfo.class": schoolClass._id,
          academicYear: academicYear,
          "basicInfo.gender": "male",
          active: true,
        }).lean();
        info.maleStudents = studentMaleCount;

        const studentFemaleCount = await Student.count({
          school: req.schoolId,
          "academicInfo.class": schoolClass._id,
          academicYear: academicYear,
          "basicInfo.gender": "female",
          active: true,
        }).lean();
        info.femaleStudents = studentFemaleCount;
        info.sections = [];
        const sections = await sectionQuery.findAll({
          school: req.schoolId,
          class: schoolClass._id,
        });
        for (const section of sections) {
          const sectionStudentCount = await Student.count({
            school: req.schoolId,
            "academicInfo.class": schoolClass._id,
            "academicInfo.section": section._id,
            academicYear: academicYear,
            active: true,
          }).lean();

          const totalMaleCount = await Student.count({
            school: req.schoolId,
            "academicInfo.class": schoolClass._id,
            "academicInfo.section": section._id,
            academicYear: academicYear,
            "basicInfo.gender": "male",
            active: true,
          }).lean();

          const totalFemaleCount = await Student.count({
            school: req.schoolId,
            "academicInfo.class": schoolClass._id,
            "academicInfo.section": section._id,
            academicYear: academicYear,
            "basicInfo.gender": "female",
            active: true,
          }).lean();
          info.sections.push({
            section: section.name,
            count: sectionStudentCount,
            maleCount: totalMaleCount,
            femaleCount: totalFemaleCount,
          });
        }
        overview.push(info);
      }

      let result = {
        data: overview,
        totalStudentsCount,
        totalMaleStudentsCount,
        totalFemaleStudentsCount,
      };
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Students overview fetched successfully",
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async resuffle(req) {
    try {
      const { sectionId, classId, currentSectionId, studentIds } = req.body;

      const sectionWithTheGivenId = await sectionQuery.findOne({
        _id: sectionId,
        class: classId,
      });

      if (!sectionWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Section to move students into was not found!",
          responseCode: "CLIENT_ERROR",
        });

      const currentSection = await sectionQuery.findOne({
        _id: currentSectionId,
        class: classId,
      });

      if (!currentSection)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Section to move students from was not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(req.body.studentIds))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_req,
          message: "Send students in list",
          responseCode: "CLIENT_ERROR",
        });
      const shuffleStudents = await studentQuery.updateList(
        {
          "academicInfo.class": classId,
          "academicInfo.section": currentSectionId,
          _id: { $in: studentIds },
        },
        {
          $set: { "academicInfo.section": sectionId },
        },
        { new: true, runValidators: true }
      );

      let school = await schoolQuery.findOne({ _id: req.schoolId });

      if (school.rollNumberType === "manual") {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Students reshuffled successfully!!!",
          result: shuffleStudents,
        });
      } else {
        // Fetch all students in both the current and new sections
        const studentsInCurrentSection = await studentQuery.find({
          "academicInfo.class": classId,
          "academicInfo.section": currentSectionId,
        });

        const studentsInNewSection = await studentQuery.find({
          "academicInfo.class": classId,
          "academicInfo.section": sectionId,
        });

        const updateRollNumbers = async (students) => {
          for (let i = 0; i < students.length; i++) {
            students[i].academicInfo.rollNumber = i + 1;
            await students[i].save();
          }
        };

        if (school.rollNumberType === "autoAscendingName") {
          const sortedCurrentSectionStudents = sortStudents(
            studentsInCurrentSection,
            "name"
          );
          const sortedNewSectionStudents = sortStudents(
            studentsInNewSection,
            "name"
          );
          // Update roll numbers for both sections
          await updateRollNumbers(sortedCurrentSectionStudents);
          await updateRollNumbers(sortedNewSectionStudents);
        } else {
          const sortedCurrentSectionStudents = sortStudents(
            studentsInCurrentSection,
            "gender"
          );
          const sortedNewSectionStudents = sortStudents(
            studentsInNewSection,
            "gender"
          );
          // Update roll numbers for both sections
          await updateRollNumbers(sortedCurrentSectionStudents);
          await updateRollNumbers(sortedNewSectionStudents);
        }
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Students reshuffled successfully!!!",
        result: shuffleStudents,
      });
    } catch (error) {
      throw error;
    }
  }

  // TODO
  static async studentsResuffleListExcel(req) {
    try {
      const { academicYearId, classId } = req.query;
      const xlsxPath = path.join("./static", "xlsx.full.min.js");
      const academicYear = await academicYearQuery.findOne({
        _id: academicYearId,
      });

      if (!academicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Academic year not found!",
          responseCode: "CLIENT_ERROR",
        });

      const schoolClass = await classQuery.findOne({ _id: classId });
      if (!schoolClass)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Class not found!",
          responseCode: "CLIENT_ERROR",
        });
      const sections = await sectionQuery.findAll({
        class: schoolClass._id,
      });

      const sectionStudentList = [];
      for (const section of sections) {
        const students = await studentQuery.findAll({
          academicYear: academicYear._id,
          "academicInfo.class": schoolClass._id,
          "academicInfo.section": section._id,
          active: true,
        });

        sectionStudentList.push({
          sectionName: section.name,
          students,
        });
      }
      let school = await schoolQuery.findOne({ _id: req.schoolId });

      const pdfData = {
        sectionStudentList,
        settings: school,
        academicYearActive: academicYear,
      };
      const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ["--disable-extensions"],
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--hide-scrollbars",
          "--disable-gpu",
          "--mute-audio",
        ],
      });
      const page = await browser.newPage();

      const content = await compileTemplate("student-resuffle-list", pdfData);

      await page.setContent(content);

      await page.addScriptTag({ path: xlsxPath });

      const xlsxFile = await page.evaluate((sections) => {
        var tables = document.body.getElementsByTagName("table");
        let wb = XLSX.utils.book_new();
        for (let i = 0; i < tables.length; i++) {
          let workSheet = XLSX.utils.table_to_sheet(tables[i]);
          XLSX.utils.book_append_sheet(
            wb,
            workSheet,
            `  ${sections[i].sectionName}  `
          );
        }
        return XLSX.write(wb, { type: "binary", bookType: "xlsx" });
      }, sections);

      browser.close();

      const bufferXlsx = new Buffer.from(xlsxFile, "binary");

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: bufferXlsx,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // TODO
  static async updateStudentResuffle(req) {
    try {
      const { academicYearId, classId } = req.body;
      const files = req.files;

      if (!files.file)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_req,
          message: "Please select file",
          responseCode: "CLIENT_ERROR",
        });

      let file = files.file;

      if (
        file.mimetype != "application/vnd.oasis.opendocument.spreadsheet" &&
        file.mimetype !=
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
        file.mimetype != "text/csv" &&
        file.mimetype != "application/vnd.ms-excel"
      )
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Provide valid sheet file",
          responseCode: "CLIENT_ERROR",
        });

      const academicYear = await academicYearQuery.findOne({
        _id: academicYearId,
      });
      if (!academicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Academic Year not found!",
          responseCode: "CLIENT_ERROR",
        });
      const schoolClass = await classQuery.findOne({ _id: classId });
      if (!schoolClass) throw new Error("No class found");

      const workbook = xlsx.read(file.buffer);
      const sheetNames = workbook.SheetNames;

      // check the sheet name and check the list of students , then update the students with the
      // section name

      for (let i = 0; i < sheetNames.length; i++) {
        let section = await sectionQuery.findOne({
          name: sheetNames[i].trim(),
          class: classId,
        });
        if (!section)
          return common.failureResponse({
            statusCode: httpStatusCode.not_found,
            message: "Section not found!",
            responseCode: "CLIENT_ERROR",
          });

        let sectionSheetData = xlsx.utils.sheet_to_json(
          workbook.Sheets[sheetNames[i]]
        );

        let studentData = [];

        sectionSheetData.forEach((d) => studentData.push(d));

        for (let i = 0; i < studentData.length; i++) {
          let student = await studentQuery.findOne({
            _id: studentData[i].Student_Id,
          });
          if (!student) {
            return common.failureResponse({
              statusCode: httpStatusCode.bad_request,
              message: "Invalid student Id or student was not found!",
              responseCode: "CLIENT_ERROR",
            });
          }

          student = await studentQuery.updateOne(
            { _id: student._id },
            {
              $set: {
                "academicInfo.section": section._id,
                "academicInfo.rollNumber": studentData[i].Roll_No,
              },
            },
            { new: true }
          );
        }
      }
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Students are updated successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  // done
  static async bulkUpdateSheet(req) {
    try {
      // Fetch all students from the database
      const { academicYearId, classId, sectionId } = req.query;
      if (!academicYearId || !classId || !sectionId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide academic year, class, and section",
          responseCode: "CLIENT_ERROR",
        });

      if (sectionId === "all")
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide a section",
          responseCode: "CLIENT_ERROR",
        });

      const academicYear = await academicYearQuery.findOne({
        _id: academicYearId,
      });

      if (!academicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Academic Year not found!",
          responseCode: "CLIENT_ERROR",
        });

      const schoolClass = await classQuery.findOne({ _id: classId });
      if (!schoolClass)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Class not found!",
          responseCode: "CLIENT_ERROR",
        });

      const section = await sectionQuery.findOne({
        class: schoolClass._id,
        _id: sectionId,
      });

      if (!section)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Section not found!",
          responseCode: "CLIENT_ERROR",
        });

      let students = await Student.find({
        academicYear: academicYear._id,
        "academicInfo.class": schoolClass._id,
        "academicInfo.section": section._id,
        active: true,
      })
        .select(
          "-academicInfo.class -academicInfo.section -school -academicInfo.fallbackClass -academicInfo.fallbackSection -academicYear -transportInfo -hostelInfo -password -expoPushToken -authToken -verificationOtp -otpExpiry"
        )
        .lean();

      // Format students data
      const formattedData = students.map((student) => {
        const flatStudent = flattenObject(student);

        // Format dates
        if (flatStudent["basicInfo_admissionDate"]) {
          flatStudent["basicInfo_admissionDate"] = moment(
            flatStudent["basicInfo_admissionDate"]
          ).format("DD/MM/YYYY");
        }
        if (flatStudent["basicInfo_dob"]) {
          flatStudent["basicInfo_dob"] = moment(
            flatStudent["basicInfo_dob"]
          ).format("DD/MM/YYYY");
        }
        return flatStudent;
      });

      // Create a new workbook and add a worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(
        `${schoolClass.name}-${section.name}`
      );

      // Get all unique headers
      const headers = Object.keys(
        formattedData.reduce((result, student) => {
          return { ...result, ...student };
        }, {})
      );

      // Add headers to the worksheet
      worksheet.columns = headers.map((header) => ({ header, key: header }));

      const firstRow = worksheet.getRow(1);

      // Iterate through each cell in the first row and apply bold styling
      firstRow.eachCell((cell) => {
        cell.font = { bold: true };
      });

      worksheet.columns.forEach((column, columnIndex) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 0
          );
        });
        column.width = maxLength + 2; // Add some extra width for padding
      });

      // Add rows to the worksheet
      formattedData.forEach((student) => {
        worksheet.addRow(student);
      });

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          // Apply horizontal and vertical alignment to center the content
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });
      });

      let buffer = await workbook.xlsx.writeBuffer();

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Students are downloaded successfully!",
        result: buffer,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // done
  static async bulkUpdate(req, res) {
    try {
      // Validate file upload
      if (!req.files || Object.keys(req.files).length === 0) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No files were uploaded",
          responseCode: "CLIENT_ERROR",
        });
      }

      // Accessing the uploaded file
      const excelFile = req.files.file;
      console.log("Uploaded Excel file: ", excelFile.name);

      // Generate a unique filename
      const filename = `${Date.now()}_${excelFile.name}`;

      // Ensure the uploads directory exists
      const uploadsDir = path.join(__dirname, "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      // Save the file locally for processing
      const filePath = path.join(uploadsDir, filename);
      await excelFile.mv(filePath);
      console.log("File saved to: ", filePath);

      // Read the uploaded Excel file using exceljs
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1); // Assuming there's only one worksheet

      // Initialize an array to store student updates
      const updates = [];

      // Iterate through each row in the Excel sheet (starting from the second row, assuming first row is headers)
      worksheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
        if (rowIndex === 1) {
          // Skip header row
          return;
        }

        // Construct update object for each row
        const updateObject = {};

        row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
          const header = worksheet.getCell(1, colIndex).value; // Assuming headers are in the first row
          const key = convertHeaderToMongoKey(header); // Function to convert header to MongoDB key

          if (key) {
            // Check if the cell value is a URL and convert it to string
            let value;
            if (cell.type === ExcelJS.ValueType.Hyperlink) {
              value = cell.hyperlink;
            } else if (cell.value instanceof Object && cell.value.richText) {
              value = cell.value.richText.map((part) => part.text).join("");
            } else {
              value = cell.value;
            }

            updateObject[key] = value;
          }
        });

        // Assuming _id is provided in the Excel sheet
        if (updateObject["_id"]) {
          const _id = updateObject["_id"].replace(/^"|"$/g, ""); // Remove double quotes
          if (mongoose.Types.ObjectId.isValid(_id)) {
            delete updateObject["_id"];

            // Prepare update operation
            updates.push({
              updateOne: {
                filter: { _id: mongoose.Types.ObjectId(_id) },
                update: { $set: updateObject },
              },
            });
          } else {
            console.warn(`Invalid ObjectId: ${_id}`);
          }
        }
      });

      // Perform bulk update operations
      const result = await Student.bulkWrite(updates);
      console.log("Bulk write result: ", result);

      // Delete the uploaded file after processing
      fs.unlinkSync(filePath);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Students updated successfully!",
      });
    } catch (error) {
      console.error("Error during bulk update: ", error);
      throw error;
    }
  }

  static async promote(req) {
    try {
      const {
        currentClassId,
        currentSectionId,
        promoteClassId,
        promoteAcademicYearId,
        promoteSectionId,
        studentIds,
      } = req.body;

      console.log(req.body, "body");

      const [
        academicYearCurrent,
        academicYear,
        promoteClass,
        currentClass,
        promoteSection,
        currentSection,
      ] = await Promise.all([
        academicYearQuery.findOne({
          active: true,
        }),
        academicYearQuery.findOne({
          _id: promoteAcademicYearId,
          active: false,
        }),
        classQuery.findOne({ _id: promoteClassId }),
        classQuery.findOne({ _id: currentClassId }),
        sectionQuery.findOne({
          _id: promoteSectionId,
          class: promoteClassId,
        }),
        sectionQuery.findOne({
          _id: currentSectionId,
          class: currentClassId,
        }),
      ]);

      if (!academicYearCurrent)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Academic Year not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (!academicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Academic Year not found!",
          responseCode: "CLIENT_ERROR",
        });
      if (!promoteClass)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Class not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (!currentClass)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Current class not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (!promoteSection)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Section to promote was not found!",
          responseCode: "CLIENT_ERROR",
        });
      if (!currentSection)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Current section was not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(studentIds))
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Please send list of students!",
          responseCode: "CLIENT_ERROR",
        });

      const studentsInCurrentSection = await studentQuery.findAll({
        school: req.schoolId,
        "academicInfo.class": currentClass._id,
        "academicInfo.section": currentSection._id,
        academicYear: academicYearCurrent._id,
        _id: { $in: studentIds },
        active: true,
      });

      const studentsInPromoteSection = await studentQuery.findAll({
        school: req.schoolId,
        "academicInfo.class": promoteClass._id,
        "academicInfo.section": promoteSection._id,
        academicYear: promoteAcademicYearId,
      });

      let studentsToPromote = [];

      for (let student of studentsInCurrentSection) {
        if (
          studentsInPromoteSection.find(
            (s) =>
              s.academicInfo.admissionNumber.toString() ===
              student.academicInfo.admissionNumber.toString()
          )
        ) {
          return common.failureResponse({
            statusCode: httpStatusCode.conflict,
            message: `Student ${student.name} with admission number ${student.academicInfo.admissionNumber} already exists in the promoted section!`,
            responseCode: "CLIENT_ERROR",
          });
        } else {
          student.academicYear = promoteAcademicYearId;
          student.academicInfo.class = promoteClass._id;
          student.academicInfo.section = promoteSection._id;
          delete student._id;
          studentsToPromote.push(student);
        }
      }

      await Student.insertMany(studentsToPromote);

      let school = await schoolQuery.findOne({ _id: req.schoolId });

      if (school.rollNumberType === "manual") {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Selected students have been promoted!",
          // result: promotedStudents,
        });
      } else {
        // Fetch all students in both the current and new sections
        const studentsInCurrentSection = await studentQuery.find({
          "academicInfo.class": currentClassId,
          "academicInfo.section": currentSectionId,
          academicYear: academicYearCurrent._id,
          active: true,
        });

        const studentsInNewSection = await studentQuery.find({
          "academicInfo.class": promoteClassId,
          "academicInfo.section": promoteSectionId,
          academicYear: promoteAcademicYearId,
          active: true,
        });

        const updateRollNumbers = async (students) => {
          for (let i = 0; i < students.length; i++) {
            students[i].academicInfo.rollNumber = i + 1;
            await students[i].save();
          }
        };

        if (school.rollNumberType === "autoAscendingName") {
          const sortedCurrentSectionStudents = sortStudents(
            studentsInCurrentSection,
            "name"
          );
          const sortedNewSectionStudents = sortStudents(
            studentsInNewSection,
            "name"
          );
          // Update roll numbers for both sections
          await updateRollNumbers(sortedCurrentSectionStudents);
          await updateRollNumbers(sortedNewSectionStudents);
        } else {
          const sortedCurrentSectionStudents = sortStudents(
            studentsInCurrentSection,
            "gender"
          );
          const sortedNewSectionStudents = sortStudents(
            studentsInNewSection,
            "gender"
          );
          // Update roll numbers for both sections
          await updateRollNumbers(sortedCurrentSectionStudents);
          await updateRollNumbers(sortedNewSectionStudents);
        }
      }
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Selected students have been promoted!",
        // result: promoteStudents,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateHostelMember(req) {
    try {
      const { id } = req.params;
      const { hostel, room, bed } = req.body;

      // check if hostel, room, bed and student exists or not
      // check if student has hostel and room allocated already or not;
      // if the student is not alloted any hostel and room then allot and update room and student hostel info;
      // if the student has been alloted , check if h

      let requiredHostel = await hostelQuery.findOne({ _id: hostel });
      if (!requiredHostel)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Hostel not found!",
          responseCode: "CLIENT_ERROR",
        });

      const roomExist = await roomQuery.findOne({ _id: room, hostel: hostel });

      if (!roomExist) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `This room does not exists in this hostel`,
          responseCode: "CLIENT_ERROR",
        });
      }

      if (!roomExist.beds.find((b) => b._id?.toString() !== bed)) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `This bed does not exist in the given hostel and room`,
          responseCode: "CLIENT_ERROR",
        });
      }

      let existingStudent = await Student.findById(id);
      if (!existingStudent) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `Student with ID ${id} was not found`,
          responseCode: "CLIENT_ERROR",
        });
      }

      if (!roomExist.beds.length) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `No beds have been added to this room`,
          responseCode: "CLIENT_ERROR",
        });
      }

      let requestedBed = roomExist.beds.find((b) => b._id?.toString() === bed);

      if (
        requestedBed.allocated &&
        existingStudent.hostelInfo.bed?.toString() !== bed
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `This bed is already allocated`,
          responseCode: "CLIENT_ERROR",
        });
      }

      if (!requestedBed.enabled) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `This bed is not available to allocate`,
          responseCode: "CLIENT_ERROR",
        });
      }

      console.log(roomExist, "roomExist");

      if (existingStudent.hostelInfo) {
        // check if the room's bed he has been alloted is the same as alloted before
        // check if the room that he is being assigned has any bed that has not been alloted

        if (
          roomExist.beds.filter((b) => b._id.toHexString() == bed)[0].allocated
        ) {
          if (existingStudent.hostelInfo.bed.toHexString() == bed) {
            return common.failureResponse({
              statusCode: httpStatusCode.not_found,
              message: `This Bed is already alloted to this student!`,
              responseCode: "CLIENT_ERROR",
            });
          } else if (existingStudent.hostelInfo.bed.toHexString() != bed) {
            return common.failureResponse({
              statusCode: httpStatusCode.not_found,
              message: `This Bed is already alloted!`,
              responseCode: "CLIENT_ERROR",
            });
          }
        } else {
          let previousRoom = await roomQuery.updateOne(
            {
              _id: existingStudent.hostelInfo.room,
              "beds._id": existingStudent.hostelInfo.bed,
            },
            {
              $inc: { allocatedSeats: -1 },
              $set: { "beds.$.allocated": false },
            }
          );

          let currentRoom = await roomQuery.updateOne(
            { "beds._id": bed },
            { $inc: { allocatedSeats: 1 }, $set: { "beds.$.allocated": true } }
          );

          existingStudent = await studentQuery.updateOne(
            { _id: req.params.id },
            {
              $set: {
                "hostelInfo.name": hostel,
                "hostelInfo.room": room,
                "hostelInfo.bed": bed,
                "hostelInfo.roomType": roomExist.type?._id,
                "otherInfo.hostelMember": true,
              },
            },
            { new: true, runValidators: true }
          );
        }

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Hostel details updated successfully!",
          result: existingStudent,
        });
      } else {
        let currentRoom = await roomQuery.updateOne(
          { "beds._id": bed },
          { $inc: { allocatedSeats: 1 }, $set: { "beds.$.allocated": true } }
        );
        existingStudent = await studentQuery.updateOne(
          { _id: req.params.id },
          {
            $set: {
              "otherInfo.hostelMember": true,
              "hostelInfo.name": hostel,
              "hostelInfo.room": room,
              "hostelInfo.bed": bed,
              "hostelInfo.roomType": roomExist.type?._id,
            },
          },
          { new: true, runValidators: true }
        );

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Hostel details updated successfully!",
          result: existingStudent,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async removeHostelMember(req) {
    try {
      const { id } = req.params;

      let existingStudent = await studentQuery.findOne({ _id: id });
      if (!existingStudent) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `Student with ID ${id} was not found`,
          responseCode: "CLIENT_ERROR",
        });
      }

      await roomQuery.updateOne(
        { "beds._id": existingStudent.hostelInfo.bed },
        { $inc: { allocatedSeats: -1 }, $set: { "beds.$.allocated": false } }
      );

      existingStudent = await studentQuery.updateOne(
        { _id: id },
        {
          $set: {
            "otherInfo.hostelMember": false,
            "hostelInfo.name": null,
            "hostelInfo.room": null,
            "hostelInfo.bed": null,
            "hostelInfo.roomType": null,
          },
        },
        { new: true, runValidators: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student's hostel details updated successfully!",
        result: existingStudent,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateTransportMember(req) {
    try {
      const { id } = req.params;

      const { routeId, stopId, pickType } = req.body;

      let existingStudent = await studentQuery.findOne({ _id: id });
      if (!existingStudent) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `Student with ID ${id} was not found`,
          responseCode: "CLIENT_ERROR",
        });
      }

      let stopExists = await stopQuery.findOne({ _id: stopId });
      if (!stopExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `Stop with ID ${stopId} was not found`,
          responseCode: "CLIENT_ERROR",
        });

      let routeExists = await routeQuery.findOne({ _id: routeId });
      if (!routeExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `Route with ID ${routeId} was not found`,
          responseCode: "CLIENT_ERROR",
        });
      let vehicleId = routeExists.vehicle._id;

      if (!routeExists.stops.map((s) => s._id.toHexString()).includes(stopId)) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `This stop does not belong to the given route!`,
          responseCode: "CLIENT_ERROR",
        });
      }

      existingStudent = await studentQuery.updateOne(
        { _id: req.params.id },
        {
          $set: {
            "otherInfo.transportMember": true,
            "otherInfo.busStop": stopExists.name,
            "transportInfo.route": routeId,
            "transportInfo.vehicle": vehicleId,
            "transportInfo.stop": stopId,
            "transportInfo.pickType": pickType,
          },
        },
        { new: true, runValidators: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Transport member updated successfully!",
        result: existingStudent,
      });
    } catch (error) {
      throw error;
    }
  }

  static async removeTransportMember(req) {
    try {
      const { id } = req.params;

      let existingStudent = await studentQuery.findOne({ _id: id });
      if (!existingStudent) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `Student with ID ${id} was not found`,
          responseCode: "CLIENT_ERROR",
        });
      }

      existingStudent = await studentQuery.updateOne(
        { _id: id },
        {
          $set: {
            "otherInfo.transportMember": false,
            "otherInfo.busStop": "",
            "transportInfo.route": null,
            "transportInfo.vehicle": null,
            "transportInfo.stop": null,
            "transportInfo.pickType": null,
          },
        },
        { new: true, runValidators: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Transport member details updated successfully!",
        result: existingStudent,
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateLibraryMember(req) {
    try {
      const { id } = req.params;

      let existingStudent = await studentQuery.findOne({ _id: id });
      if (!existingStudent) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `Student with ID ${id} was not found`,
          responseCode: "CLIENT_ERROR",
        });
      }

      existingStudent = await studentQuery.updateOne(
        { _id: id },
        {
          $set: {
            "otherInfo.libraryMember": true,
          },
        },
        { new: true, runValidators: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student added to library member!",
        result: existingStudent,
      });
    } catch (error) {
      throw error;
    }
  }

  static async removeLibraryMember(req) {
    try {
      const { id } = req.params;

      let existingStudent = await studentQuery.findOne({ _id: id });
      if (!existingStudent) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `Student with ID ${id} was not found`,
          responseCode: "CLIENT_ERROR",
        });
      }

      existingStudent = await studentQuery.updateOne(
        { _id: id },
        {
          $set: {
            "otherInfo.libraryMember": false,
          },
        },
        { new: true, runValidators: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student removed from library members!",
        result: existingStudent,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getDashboardStudentDetails(req) {
    try {
      let students = await Student.aggregate([
        {
          $match: {
            school: mongoose.Types.ObjectId(req.schoolId),
          },
        },
        {
          $group: {
            _id: {
              class: "$academicInfo.class",
              section: "$academicInfo.section",
            },
            studentCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "classes",
            localField: "_id.class",
            foreignField: "_id",
            as: "classInfo",
          },
        },
        {
          $unwind: "$classInfo",
        },
        {
          $lookup: {
            from: "sections",
            localField: "_id.section",
            foreignField: "_id",
            as: "sectionInfo",
          },
        },
        {
          $unwind: "$sectionInfo",
        },
        {
          $group: {
            _id: "$classInfo.name",
            sections: {
              $push: {
                sectionName: "$sectionInfo.name",
                studentCount: "$studentCount",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            className: "$_id",
            sections: {
              $arrayToObject: {
                $map: {
                  input: "$sections",
                  as: "section",
                  in: {
                    k: "$$section.sectionName",
                    v: "$$section.studentCount",
                  },
                },
              },
            },
          },
        },
        {
          $sort: {
            className: 1,
          },
        },
      ]);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student details fetched successfully!",
        result: students,
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadAllStudentsExcel(req) {
    try {
      const { academicYearId } = req.query;
      const academicYear = await academicYearQuery.findOne({
        _id: academicYearId,
      });
      if (!academicYear)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `Academic year with ID ${academicYearId} was not found`,
          responseCode: "CLIENT_ERROR",
        });

      const classes = await classQuery.findAll({ school: req.schoolId });

      const workBook = new ExcelJS.Workbook();

      for (let schoolClass of classes) {
        const students = await studentQuery.findAll({
          academicYear: academicYear._id,
          "academicInfo.class": schoolClass._id,
          active: true,
        });

        const workSheet = workBook.addWorksheet(
          `${schoolClass.name} - Standard`
        );

        const Header = [
          "S.No",
          "Admission No",
          "Roll Number",
          "Section",
          "Name",
          "Admission Date",
          "Date of Birth",
          "Gender",
          "Father Name",
          "Mother Name",
          "Father Number",
          "Mother Number",
          "RTE",
          "Religion",
          "Aadhar Number",
          "Caste",
          "Caste Income Certificate Number",
          "Present Address",
          "Permanent Address",
          "Father Education",
          "Father Profession",
          "Father Designation",
          "Mother Education",
          "Mother Profession",
          "Mother Designation",
          "Guardian Name",
          "Mother Tongue",
          "Hostel Member",
          "Transport Member",
          "Library Member",
          "Bus Stop",
        ];

        workSheet.addRow(Header);

        for (let student of students) {
          let newRow = [
            students.indexOf(student) + 1,
            student.academicInfo?.admissionNumber,
            student.academicInfo?.rollNumber,
            student.academicInfo?.section?.name,
            student.basicInfo?.name,
            moment(student.basicInfo?.admissionDate).format("DD.MM.YYYY"),
            moment(student.basicInfo?.dob).format("DD.MM.YYYY"),
            student.basicInfo?.gender,
            student.fatherInfo?.name,
            student.motherInfo?.name,
            student.fatherInfo?.contactNumber,
            student.motherInfo?.contactNumber,
            student.basicInfo?.rte,
            student.basicInfo?.religion,
            student.basicInfo?.aadharNo,
            student.basicInfo?.caste,
            student.basicInfo?.cicn,
            student.contactInfo?.presentAddress,
            student.contactInfo?.permanentAddress,
            student.fatherInfo?.education,
            student.fatherInfo?.profession,
            student.fatherInfo?.designation,
            student.motherInfo?.education,
            student.motherInfo?.profession,
            student.motherInfo?.designation,
            student.contactInfo?.guardianName,
            student.basicInfo?.motherTongue,
            student.otherInfo?.hostelMember,
            student.otherInfo?.transportMember,
            student.otherInfo?.libraryMember,
            student.otherInfo?.busStop,
          ];

          workSheet.addRow(newRow);
        }

        workSheet.eachRow((row) => {
          row.eachCell((cell) => {
            // Apply horizontal and vertical alignment to center the content
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
            };
          });
        });
        // Get the first row
        const firstRow = workSheet.getRow(1);

        // Iterate through each cell in the first row and apply bold styling
        firstRow.eachCell((cell) => {
          cell.font = { bold: true };
        });

        workSheet.columns.forEach((column, columnIndex) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            maxLength = Math.max(
              maxLength,
              cell.value ? cell.value.toString().length : 0
            );
          });
          column.width = maxLength + 2; // Add some extra width for padding
        });
      }

      const bufferXlsx = await workBook.xlsx.writeBuffer();
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student details fetched successfully!",
        result: bufferXlsx,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async downloadStudentsExcel(req) {
    try {
      const { academicYearId, classId, sectionId, active } = req.query;
      const [academicYearData, classData] = await Promise.all([
        academicYearQuery.findOne({ _id: academicYearId }),
        classQuery.findOne({ _id: classId, school: req.schoolId }),
      ]);

      if (!academicYearData) return notFoundError("Academic Year not found");
      if (!classData) return notFoundError("Class not found");

      let filter = {
        school: req.schoolId,
        active,
        "academicInfo.class": classId,
        academicYear: academicYearData._id,
      };

      const Header = [
        "S.No",
        "Admission No",
        "Roll Number",
        "Section",
        "Name",
        "Admission Date",
        "Date of Birth",
        "Gender",
        "Father Name",
        "Mother Name",
        "Father Number",
        "Mother Number",
        "RTE",
        "Religion",
        "Aadhar Number",
        "Caste",
        "Caste Income Certificate Number",
        "Present Address",
        "Permanent Address",
        "Father Education",
        "Father Profession",
        "Father Designation",
        "Mother Education",
        "Mother Profession",
        "Mother Designation",
        "Guardian Name",
        "Mother Tongue",
        "Hostel Member",
        "Transport Member",
        "Library Member",
        "Bus Stop",
      ];

      if (sectionId !== "all") {
        const workBook = new ExcelJS.Workbook();
        let sectionWithGivenId = await sectionQuery.findOne({
          class: classId,
          _id: sectionId,
        });
        if (!sectionWithGivenId)
          return notFoundError("Section with given id not found");
        filter["academicInfo.section"] = sectionId;
        let students = await studentQuery.findAll(filter);

        const workSheet = workBook.addWorksheet(
          `${classData.name}-${sectionWithGivenId.name} - Standard`
        );

        workSheet.addRow(Header);

        for (let student of students) {
          let newRow = [
            students.indexOf(student) + 1,
            student.academicInfo?.admissionNumber,
            student.academicInfo?.rollNumber,
            student.academicInfo?.section?.name,
            student.basicInfo?.name,
            moment(student.basicInfo?.admissionDate).format("DD.MM.YYYY"),
            moment(student.basicInfo?.dob).format("DD.MM.YYYY"),
            student.basicInfo?.gender,
            student.fatherInfo?.name,
            student.motherInfo?.name,
            student.fatherInfo?.contactNumber,
            student.motherInfo?.contactNumber,
            student.basicInfo?.rte,
            student.basicInfo?.religion,
            student.basicInfo?.aadharNo,
            student.basicInfo?.caste,
            student.basicInfo?.cicn,
            student.contactInfo?.presentAddress,
            student.contactInfo?.permanentAddress,
            student.fatherInfo?.education,
            student.fatherInfo?.profession,
            student.fatherInfo?.designation,
            student.motherInfo?.education,
            student.motherInfo?.profession,
            student.motherInfo?.designation,
            student.contactInfo?.guardianName,
            student.basicInfo?.motherTongue,
            student.otherInfo?.hostelMember,
            student.otherInfo?.transportMember,
            student.otherInfo?.libraryMember,
            student.otherInfo?.busStop,
          ];

          workSheet.addRow(newRow);
        }

        workSheet.eachRow((row) => {
          row.eachCell((cell) => {
            // Apply horizontal and vertical alignment to center the content
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
            };
          });
        });
        // Get the first row
        const firstRow = workSheet.getRow(1);

        // Iterate through each cell in the first row and apply bold styling
        firstRow.eachCell((cell) => {
          cell.font = { bold: true };
        });

        workSheet.columns.forEach((column, columnIndex) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            maxLength = Math.max(
              maxLength,
              cell.value ? cell.value.toString().length : 0
            );
          });
          column.width = maxLength + 2; // Add some extra width for padding
        });

        const bufferXlsx = await workBook.xlsx.writeBuffer();
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Student details fetched successfully!",
          result: bufferXlsx,
          meta: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        });
      } else {
        let sections = await sectionQuery.findAll({ class: classId });
        if (!sections.length)
          return notFoundError("No sections found for given class!");

        let workBook = new ExcelJS.Workbook();
        for (let section of sections) {
          let workSheet = workBook.addWorksheet(
            `${classData.name}-${section.name}`
          );
          let students = await studentQuery.findAll({
            ...filter,
            "academicInfo.section": section._id,
          });

          workSheet.addRow(Header);

          for (let student of students) {
            let newRow = [
              students.indexOf(student) + 1,
              student.academicInfo?.admissionNumber,
              student.academicInfo?.rollNumber,
              student.academicInfo?.section?.name,
              student.basicInfo?.name,
              moment(student.basicInfo?.admissionDate).format("DD.MM.YYYY"),
              moment(student.basicInfo?.dob).format("DD.MM.YYYY"),
              student.basicInfo?.gender,
              student.fatherInfo?.name,
              student.motherInfo?.name,
              student.fatherInfo?.contactNumber,
              student.motherInfo?.contactNumber,
              student.basicInfo?.rte,
              student.basicInfo?.religion,
              student.basicInfo?.aadharNo,
              student.basicInfo?.caste,
              student.basicInfo?.cicn,
              student.contactInfo?.presentAddress,
              student.contactInfo?.permanentAddress,
              student.fatherInfo?.education,
              student.fatherInfo?.profession,
              student.fatherInfo?.designation,
              student.motherInfo?.education,
              student.motherInfo?.profession,
              student.motherInfo?.designation,
              student.contactInfo?.guardianName,
              student.basicInfo?.motherTongue,
              student.otherInfo?.hostelMember,
              student.otherInfo?.transportMember,
              student.otherInfo?.libraryMember,
              student.otherInfo?.busStop,
            ];

            workSheet.addRow(newRow);
          }

          workSheet.eachRow((row) => {
            row.eachCell((cell) => {
              // Apply horizontal and vertical alignment to center the content
              cell.alignment = {
                horizontal: "center",
                vertical: "middle",
              };
            });
          });
          // Get the first row
          const firstRow = workSheet.getRow(1);

          // Iterate through each cell in the first row and apply bold styling
          firstRow.eachCell((cell) => {
            cell.font = { bold: true };
          });

          workSheet.columns.forEach((column, columnIndex) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
              maxLength = Math.max(
                maxLength,
                cell.value ? cell.value.toString().length : 0
              );
            });
            column.width = maxLength + 2; // Add some extra width for padding
          });
        }

        const bufferXlsx = await workBook.xlsx.writeBuffer();
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Student details fetched successfully!",
          result: bufferXlsx,
          meta: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async downloadStudentsPdf(req) {
    try {
      const { academicYearId, classId, active } = req.query;
      const academicYear = await academicYearQuery.findOne({
        _id: academicYearId,
      });

      if (!academicYear) return notFoundError("Academic year not found");

      const schoolClass = await classQuery.findOne({
        _id: classId,
        school: req.schoolId,
      });
      if (!schoolClass) return notFoundError("Class not found");

      const sections = await sectionQuery.findAll({
        class: schoolClass._id,
      });

      const sectionIds = sections.map((section) => section._id);
      const sectionStudentList = [];

      for (let i = 0; i < sections.length; i++) {
        const students = await studentQuery.findAll({
          academicYear: academicYear._id,
          "academicInfo.section": sections[i]?._id,
          "academicInfo.class": schoolClass._id,
          active: active,
        });

        sectionStudentList.push({
          sectionName: sections[i].name,
          students,
        });
      }
      const settings = await schoolQuery.findOne({ _id: req.schoolId });

      const pdfData = {
        sectionStudentList,
        settings: settings,
        academicYearActive: academicYear,
      };

      const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ["--disable-extensions"],
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--hide-scrollbars",
          "--disable-gpu",
          "--mute-audio",
        ],
      });
      const page = await browser.newPage();
      const content = await compileTemplate("student-list", pdfData);

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
        margin: 10,
      });
      browser.close();

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student details fetched successfully!",
        result: pdf,
        meta: {
          "Content-Type": "application/pdf",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async updatePhoto(req) {
    try {
      if (!req.files) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "No file uploaded",
          responseCode: "CLIENT_ERROR",
        });
      }
      if (!req.files.photo) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "No file uploaded",
          responseCode: "CLIENT_ERROR",
        });
      }

      let photo = await uploadFileToS3(req.files.photo);

      let studentWithGivenId = await studentQuery.findOne({
        _id: req.params.id,
      });

      if (!studentWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.ok,
          message: "Student with given id not found",
          responseCode: "CLIENT_ERROR",
        });

      if (studentWithGivenId.photo) {
        await deleteFile(studentWithGivenId.photo);
      }

      let updatedStudent = await studentQuery.updateOne(
        {
          _id: req.params.id,
        },
        { $set: { photo } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Student photo updated successfully",
        result: updatedStudent,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getBulkStudentAdmitSheet(req) {
    try {
      const school = await schoolQuery.findOne({ _id: req.schoolId });
      if (!school) {
        return common.failureResponse({
          statusCode: httpStatusCode.ok,
          message: "School not found",
          responseCode: "CLIENT_ERROR",
        });
      }

      const workBook = new ExcelJS.Workbook();
      const workSheet = workBook.addWorksheet("Admit Sheet");

      let Header = [
        "Name",
        "Admission Date",
        "Date of Birth",
        "Gender",
        "Contact Number",
        "Blood Group",
        "RTE",
        "Caste",
        "Cicn",
        "Mother Tongue",
        "Birth Place",
        "Aadhar Number",
        "Guardian Name",
        "Guardian Relation",
        "Father Name",
        "Father Education",
        "Father Profession",
        "Father Designation",
        "Mother Name",
        "Mother Education",
        "Mother Profession",
        "Mother Designation",
        "Email",
        "Health Condition",
        "Extra Info",
        "Present Address",
        "Permanent Address",
        "Previous School Name",
        "TC Number",
        "Hostel Member",
        "Transport Member",
        "Library Member",
        "Bus Stop",
      ];

      if (school.admissionNo === "manual") {
        Header = ["Admission Number", ...Header];
      }

      if (school.rollNumberType === "manual") {
        Header = ["Roll Number", ...Header];
      }

      workSheet.addRow(Header);

      let SAMPLE_ROW = [
        "",
        "DD/MM/YYYY",
        "DD/MM/YYYY",
        "",
        "",
        "",
        "TRUE/FALSE",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "TRUE/FALSE",
        "TRUE/FALSE",
        "TRUE/FALSE",
        "",
      ];

      if (school.admissionNo === "manual") {
        SAMPLE_ROW = [1, ...SAMPLE_ROW];
      }

      if (school.rollNumberType === "manual") {
        SAMPLE_ROW = [1, ...SAMPLE_ROW];
      }

      workSheet.addRow(SAMPLE_ROW);

      workSheet.eachRow((row) => {
        row.eachCell((cell) => {
          // Apply horizontal and vertical alignment to center the content
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });
      });
      // Get the first row
      const firstRow = workSheet.getRow(1);

      // Iterate through each cell in the first row and apply bold styling
      firstRow.eachCell((cell) => {
        cell.font = { bold: true };
      });

      workSheet.columns.forEach((column, columnIndex) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 0
          );
        });
        column.width = maxLength + 2; // Add some extra width for padding
      });

      const buffer = await workBook.xlsx.writeBuffer();

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Fetched admission sheet!",
        result: buffer,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      console.error("Error in getBulkStudentAdmitSheet:", error);
      throw error;
    }
  }

  static async bulkStudentAdmit(req) {
    try {
      const { academicYearId, classId, sectionId } = req.body;

      const [academicYearData, classData, sectionData, schoolData] =
        await Promise.all([
          academicYearQuery.findOne({ _id: academicYearId }),
          classQuery.findOne({ _id: classId }),
          sectionQuery.findOne({ _id: sectionId, class: classId }),
          schoolQuery.findOne({ _id: req.schoolId }),
        ]);

      if (!academicYearData) return notFoundError("Academic Year not found");
      if (!classData) return notFoundError("Class not found");
      if (!sectionData) return notFoundError("Section not found");
      if (!schoolData) return notFoundError("School not found");

      if (!req.files || !req.files.file)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No file uploaded",
          responseCode: "CLIENT_ERROR",
        });

      let excelFile = req.files.file;

      if (!excelFile.name.endsWith(".xlsx")) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid file format. Please upload an Excel file.",
          responseCode: "CLIENT_ERROR",
        });
      }

      // Read the uploaded Excel file using exceljs
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(excelFile.data);
      const worksheet = workbook.getWorksheet(1); // Assuming there's only one worksheet

      const headers = worksheet.getRow(1).values.slice(1); // Get headers from the first row

      const studentsToInsert = [];

      // Iterate through each row in the Excel sheet (starting from the second row)
      worksheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
        if (rowIndex === 1) {
          // Skip header row
          return;
        }

        const student = {};

        row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
          const header = headers[colIndex - 1];
          const key = convertHeaderToMongoKeyBulkAdmit(header);

          let cellValue =
            typeof cell.value === "object"
              ? extractHyperlinkText(cell.value)
              : cell.value;

          if (key) {
            if (header.includes("Date")) {
              student[key] = moment(cell.value, "DD/MM/YYYY").toDate();
            } else {
              student[key] = ["TRUE", "FALSE"].includes(cellValue)
                ? cellValue === "TRUE"
                  ? true
                  : false
                : cellValue;
            }
          }
        });
        studentsToInsert.push(student);
      });

      let rollNumberType = schoolData.rollNumberType;
      let admissionNo = schoolData.admissionNo;

      let latestStudentAdmissionNumber =
        schoolData.latestStudentAdmissionNumber;

      for (let student of studentsToInsert) {
        student["school"] = req.schoolId;
        student["academicYear"] = academicYearId;
        student["academicInfo.class"] = classId;
        student["academicInfo.section"] = sectionId;
        student["registrationYear"] = academicYearId;
        student["username"] = `${
          process.env.USERNAME_SUCCESSOR
        }_${randomNumberRange(10000000, 99999999)}`;
        student["password"] = student.contactNumber;

        if (admissionNo !== "manual") {
          student["academicInfo.admissionNumber"] =
            latestStudentAdmissionNumber + 1;
          latestStudentAdmissionNumber += 1;
        }
      }

      console.log(studentsToInsert, "students to insert");

      await schoolQuery.updateOne(
        { _id: req.schoolId },
        { $set: { latestStudentAdmissionNumber } }
      );

      // Insert new students into the database
      await Student.insertMany(studentsToInsert);

      if (schoolData.rollNumberType !== "manual") {
        if (schoolData.rollNumberType === "autoAscendingName") {
          const students = await Student.find({
            "academicInfo.class": classId,
            "academicInfo.section": sectionId,
          }).sort({ "basicInfo.name": 1 });

          // Step 3: Update roll numbers
          for (let i = 0; i < students.length; i++) {
            if (!students[i].registrationYear) {
              students[i].registrationYear = academicYearId;
            }
            students[i].academicInfo.rollNumber = i + 1;
            await students[i].save();
          }
        } else {
          const students = await Student.find({
            "academicInfo.class": classId,
            "academicInfo.section": sectionId,
          }).sort({
            "basicInfo.gender": 1,
            "basicInfo.name": 1,
          });

          for (let i = 0; i < students.length; i++) {
            if (!students[i].registrationYear) {
              students[i].registrationYear = academicYearId;
            }
            students[i].academicInfo.rollNumber = i + 1;
            await students[i].save();
          }
        }
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Students added successfully",
        result: studentsToInsert,
      });
    } catch (error) {
      throw error;
    }
  }

  static async generateIdCard(req) {
    try {
      const { classId, sectionId, studentId, sampleId } = req.query;

      if (!Array.isArray(classId) || !classId.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid class ids provided",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(sectionId) || !sectionId.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid section ids provided",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(studentId) || !studentId.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid student ids provided",
          responseCode: "CLIENT_ERROR",
        });

      if (!sampleId)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid sample id provided",
          responseCode: "CLIENT_ERROR",
        });

      const filter = {
        active: true,
        school: req.schoolId,
        "academicInfo.class": { $in: classId },
        "academicInfo.section": { $in: sectionId },
      };

      if (!classId.length) {
      }

      if (sectionId.length) {
        filter["academicInfo.section"] = { $in: sectionId };
      }
    } catch (error) {}
  }
};
