const employeeQuery = require("@db/employee/queries");
const designationQuery = require("@db/designation/queries");
const departmentQuery = require("@db/department/queries");
const roleQuery = require("@db/role/queries");
const schoolQuery = require("@db/school/queries");
const salaryGradeQuery = require("@db/salaryGrade/queries");
const leaveTypeQuery = require("@db/leaveType/queries");
const ExcelJS = require("exceljs");
// const path = require("path");
// packages
const puppeteer = require("puppeteer");
const path = require("path");

//helpers
const {
  compileTemplate,
  uploadFileToS3,
  deleteFile,
} = require("../../helper/helpers");

const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class EmployeeService {
  static async create(body, files) {
    try {
      let employeePhoto = "";
      let resume = "";
      if (files) {
        if (files.employeePhoto) {
          employeePhoto = await uploadFileToS3(files.employeePhoto);
        }
        if (files.resume) {
          resume = await uploadFileToS3(files.employeePhoto);
        }
      }
      const designationExist = await designationQuery.findOne({
        _id: ObjectId(body.basicInfo.designation),
      });
      if (!designationExist) {
        return common.failureResponse({
          message: "Mentioned designation not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const departmentExist = await departmentQuery.findOne({
        _id: ObjectId(body.academicInfo.department),
      });
      if (!departmentExist) {
        return common.failureResponse({
          message: "Mentioned department not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      if (body.role) {
        const roleExist = await roleQuery.findOne({ _id: ObjectId(body.role) });
        if (!roleExist) {
          return common.failureResponse({
            message: "Mentioned role not found!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });
        }
      } else {
        delete body.role;
      }

      if (body.academicInfo?.salaryGrade) {
        const salaryGradeExist = await salaryGradeQuery.findOne({
          _id: ObjectId(body.academicInfo.salaryGrade),
        });
        if (!salaryGradeExist) {
          return common.failureResponse({
            message: "Mentioned salary grade not found!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      if (!body.academicInfo.salaryGrade) {
        delete body.academicInfo.salaryGrade;
      }
      body.photo = employeePhoto;
      body.academicInfo.resume = resume;

      if (!body.basicInfo?.empId) {
        body.basicInfo.empId = Math.floor(
          1000 + Math.random() * 9000
        ).toString();
      }

      const newEmployee = await employeeQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Employee created successfully",
        result: newEmployee,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    let school = req.schoolId;
    let superadminRole = await roleQuery.findOne({ name: "SUPER ADMIN" });
    try {
      let employeeList = await employeeQuery.findAll({
        school,
        role: { $ne: superadminRole._id },
        ...search,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Employees fetched successfully",
        result: employeeList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId, files) {
    try {
      delete body.password;

      let employeeToUpdate = await employeeQuery.findOne({ _id: id });

      if (!employeeToUpdate)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
          message: "Employee not found!",
        });

      if (body.role && employeeToUpdate?.role?.name === "SUPER ADMIN") {
        delete body.role;
      }

      if (!body.role) delete body.role;

      if (body.basicInfo?.designation) {
        const designationExist = await designationQuery.findOne({
          _id: ObjectId(body.basicInfo.designation),
        });
        if (!designationExist) {
          return common.failureResponse({
            message: "Mentioned designation not found!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      if (body.academicInfo?.department) {
        const departmentExist = await departmentQuery.findOne({
          _id: ObjectId(body.academicInfo.department),
        });
        if (!departmentExist) {
          return common.failureResponse({
            message: "Mentioned department not found!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      if (body.academicInfo?.role) {
        const roleExist = await roleQuery.findOne({
          _id: ObjectId(body.academicInfo.role),
        });
        if (!roleExist) {
          return common.failureResponse({
            message: "Mentioned role not found!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      if (body.academicInfo?.salaryGrade) {
        const salaryGradeExist = await salaryGradeQuery.findOne({
          _id: ObjectId(body.academicInfo?.salaryGrade),
        });
        if (!salaryGradeExist) {
          return common.failureResponse({
            message: "Mentioned salary grade not found!",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      //   const leaveTypes = await leaveTypeQuery.findAllLeaveType();
      //   body.leaves = leaveTypes;

      if (!body.academicInfo?.salaryGrade) {
        delete body.academicInfo?.salaryGrade;
      }

      let employeePhoto = employeeToUpdate.photo;
      let resume = employeeToUpdate.academicInfo.resume;
      if (files) {
        if (files.employeePhoto) {
          if (employeePhoto) {
            await deleteFile(employeePhoto);
          }
          employeePhoto = await uploadFileToS3(files.employeePhoto);
        }
        if (files.resume) {
          if (resume) {
            await deleteFile(resume);
          }
          resume = await uploadFileToS3(files.resume);
        }
      }

      body.photo = employeePhoto;
      body.academicInfo.resume = resume;

      let updatedEmployee = await employeeQuery.updateOne({ _id: id }, body, {
        new: true,
      });
      if (updatedEmployee) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Employee updated successfully",
          result: updatedEmployee,
        });
      } else {
        return common.failureResponse({
          message: "Failed to update employee details",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let employeeWithGivenId = await employeeQuery.findOne({ _id: id });
      if (!employeeWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Employee not found!",
          responseCode: "CLIENT_ERROR",
        });

      if (employeeWithGivenId.role.name === "SUPER ADMIN")
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Cannot delete super user!",
          responseCode: "CLIENT_ERROR",
        });

      let employee = await employeeQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Employee deleted successfully",
        result: employee,
      });
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let employeeData = await employeeQuery.findOne({ _id: id });

      if (employeeData) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Employee fetched successfully",
          result: employeeData,
        });
      } else {
        return common.failureResponse({
          message: "Failed to find the employee details",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async employeeListPdf(res) {
    try {
      let employees = await employeeQuery.findAllEmployee({ status: "active" });
      const pdfData = {
        employees,
      };
      const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ["--disable-extension"],
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--hide-scrollbars",
          "--disable-gpu",
          "--mute-audio",
        ],
      });
      const page = await browser.newPage();

      const content = await compileTemplate("employeesList", pdfData);

      await page.setContent(content);

      const pdf = await page.pdf({
        format: "A4",
        landscape: true,
        margin: {
          left: 5,
          right: 5,
        },
      });

      browser.close();

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: pdf,
        meta: {
          "Content-Type": "application/pdf",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async employeesListExcel(req, res) {
    try {
      const { search = {} } = req.query;

      let filter = { ...search };

      if (req.schoolId) {
        filter["school"] = req.schoolId;
      }

      const workBook = new ExcelJS.Workbook();
      let sheet = workBook.addWorksheet(`Employees-List`);

      const employees = await employeeQuery.findAll(filter);

      const row1 = [
        "Emp-Id",
        "Name",
        "Designation",
        "Qualification",
        "Work-Experience",
        "Gender",
        "Phone",
        "Adhaar Number",
        "Email",
        "Present Address",
        "Date of Birth",
        "Joining Date",
        "Username",
      ];

      sheet.addRow(row1);

      for (let emp of employees) {
        let newRow = [
          emp.basicInfo.empId,
          emp.basicInfo.name,
          emp.basicInfo.designation.name,
          emp.academicInfo.qualification || "NA",
          emp.academicInfo.workExperience || "NA",
          emp.basicInfo.gender,
          emp.contactNumber,
          emp.basicInfo.aadharNo,
          emp.academicInfo.email,
          emp.basicInfo.presentAddress,
          emp.basicInfo.dob,
          emp.academicInfo.joiningDate
            ? new Date(emp.academicInfo.joiningDate).toLocaleString()
            : "NA",
          emp.username,
        ];

        sheet.addRow(newRow);
      }

      // Iterate through each row and cell to apply alignment styling
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          // Apply horizontal and vertical alignment to center the content
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });
      });
      // Get the first row
      const firstRow = sheet.getRow(1);

      // Iterate through each cell in the first row and apply bold styling
      firstRow.eachCell((cell) => {
        cell.font = { bold: true };
      });

      sheet.columns.forEach((column, columnIndex) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 0
          );
        });
        column.width = maxLength + 2; // Add some extra width for padding
      });

      const filePath = path.join(__dirname, "temp.xlsx");
      const response = await workBook.xlsx.writeBuffer({
        filename: filePath,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: response,
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      console.log(error, "error");
      throw error;
    }
  }

  static async updateLibraryMember(req) {
    try {
      const { id } = req.params;

      let existingEmployee = await employeeQuery.findOne({ _id: id });
      if (!existingEmployee) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `Employee with ID ${id} was not found`,
          responseCode: "CLIENT_ERROR",
        });
      }

      existingEmployee = await employeeQuery.updateOne(
        { _id: id },
        {
          $set: {
            libraryMember: true,
          },
        },
        { new: true, runValidators: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Employee added to library member!",
        result: existingEmployee,
      });
    } catch (error) {
      throw error;
    }
  }

  static async removeLibraryMember(req) {
    try {
      const { id } = req.params;

      let existingEmployee = await employeeQuery.findOne({ _id: id });
      if (!existingEmployee) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: `Employee with ID ${id} was not found`,
          responseCode: "CLIENT_ERROR",
        });
      }

      existingEmployee = await employeeQuery.updateOne(
        { _id: id },
        {
          $set: {
            libraryMember: false,
          },
        },
        { new: true, runValidators: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Employee removed from library members!",
        result: existingEmployee,
      });
    } catch (error) {
      throw error;
    }
  }
};
