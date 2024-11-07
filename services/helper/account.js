/**
 * name : account.js
 * author : Aman Gupta
 * created-date : 03-Nov-2021
 * Description : account helper.
 */

// Dependencies
const bcryptJs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtDecode = require("jwt-decode");
const moment = require("moment");

const ObjectId = require("mongoose").Types.ObjectId;

const utilsHelper = require("@generics/utils");
const httpStatusCode = require("@generics/http-status");

const common = require("@constants/common");
const usersData = require("@db/users/queries");

const notifications = require("../../generics/helpers/notifications");

const roleQuery = require("../../db/role/queries");
const storageQuery = require("@db/storage/queries");
const employeeQuery = require("../../db/employee/queries");
const designationQuery = require("../../db/designation/queries");
const departmentQuery = require("../../db/department/queries");
const schoolQuery = require("../../db/school/queries");
const { default: mongoose } = require("mongoose");
const Employee = require("../../db/employee/model");
const Student = require("../../db/student/model");
const ReceiptTitle = require("../../db/fee/receiptTitle/model");
const { hashing } = require("../../helper/helpers");
const Designation = require("../../db/designation/model");
const Department = require("../../db/department/model");
const Guardian = require("@db/guardian/model");

const defaultRoles = [
  "SUPER ADMIN",
  "ADMIN",
  "HR",
  "TEACHER",
  "STUDENT",
  "GUARDIAN",
  "ACCOUNTANT",
  "LIBRARIAN",
  "RECEPTIONIST",
  "STAFF",
  "SERVENT",
  "TRANSPORT",
  "PRINCIPAL",
  "WARDEN",
];

const defaultDesignation = [
  "SUPER ADMIN",
  "Teacher",
  "Transport",
  "Receptionist",
  "Sr Accountant",
  "Librarian",
  "Vice Principal",
  "Principal",
  "Warden",
  "Clerk",
  "Accountant",
  "Driver",
];

let newSchoolData = {
  address: "ABC NAGAR",
  phone: "9944603844",
  regDate: new Date("2023-05-20T00:00:00.000+00:00"),
  email: "webspruce@gmail.com",
  studentAttendenceType: "classWise",
  active: true,
  sessionStartMonth: new Date("2024-05-09T18:30:00.000+00:00"),
  sessionEndMonth: new Date("2024-04-09T18:30:00.000+00:00"),
};

module.exports = class AccountHelper {
  /**
   * create account
   * @method
   * @name create
   * @param {Object} bodyData -request body contains user creation deatils.
   * @param {String} bodyData.secretCode - secrate code to create mentor.
   * @param {String} bodyData.name - name of the user.
   * @param {Boolean} bodyData.isAMentor - is a mentor or not .
   * @param {String} bodyData.email - user email.
   * @param {String} bodyData.password - user password.
   * @returns {JSON} - returns account creation details.
   */

  static async create(req) {
    try {
      const { schoolName, employeeName } = req.body;
      let storage = await storageQuery.findOne({});
      if (!storage) {
        storage = await storageQuery.create({});
      }
      for (let roleName of defaultRoles) {
        await roleQuery.updateOne(
          { name: { $regex: new RegExp(`^${roleName}$`, "i") } },
          {
            $set: {
              name: roleName,
              orderSequence: defaultRoles.indexOf(roleName) + 1,
            },
          },
          { upsert: true }
        );
      }

      let idOfSuperAdmin = await roleQuery.findOne({ name: "SUPER ADMIN" });

      let dep = await departmentQuery.create({
        name: "SUPER ADMIN",
        orderSequence: 1,
      });

      const employees = await employeeQuery.findAll({});
      const designation = await Designation.find({});
      const department = await Department.find({});
      let school = await schoolQuery.findAll({});

      if (
        !employees.length &&
        !designation.length &&
        department.length &&
        !school.length
      ) {
        for (let designation of defaultDesignation) {
          await designationQuery.updateOne(
            { name: { $regex: new RegExp(`^${designation}$`, "i") } },
            {
              $set: {
                name: designation,
                orderSequence: defaultDesignation.indexOf(designation) + 1,
              },
            },
            { upsert: true }
          );
        }
        let schoolId = new mongoose.Types.ObjectId();
        let newSchool = await schoolQuery.create({
          ...newSchoolData,
          name: schoolName,
          _id: schoolId,
        });

        let superDesignation = await designationQuery.findOne({
          name: "SUPER ADMIN",
        });
        let superDepartment = await departmentQuery.findOne({
          name: "SUPER ADMIN",
        });
        let createdSchool = await schoolQuery.findOne({ _id: schoolId });

        await new Employee({
          school: schoolId,
          fallbackSchool: createdSchool,
          basicInfo: {
            empId: "0001",
            name: employeeName,
            designation: superDesignation._id,
            fallbackDesignation: superDesignation,
            gender: "male",
            dob: Date.now(),
          },
          academicInfo: {
            department: superDepartment._id,
            fallbackDepartment: superDepartment,
            joiningDate: Date.now(),
            email: "abc@gmail.com",
          },
          username: "super",
          password: "1234",
          role: idOfSuperAdmin._id,
          fallbackRole: {},
          contactNumber: 9686156363,
          active: true,
        }).save();
      }

      return common.successResponse({
        message: "Successfull",
      });
    } catch (error) {
      throw error;
    }
  }

  static async refreshToken(req) {
    try {
      const prevAccessToken = req.get("access_token");
      if (!prevAccessToken) {
        return common.failureResponse({
          message: "Please login again!",
          statusCode: httpStatusCode.unauthorized,
          responseCode: "CLIENT_ERROR",
        });
      }
      let decodedToken = jwtDecode.jwtDecode(prevAccessToken);

      const { _id, schoolId, userType, iat, exp } = decodedToken;

      const currentTime = moment().unix();

      // Get the expiration time from the token data
      const expirationTime = decodedToken.exp;

      if (!expirationTime)
        return common.failureResponse({
          message: "Please login again!",
          statusCode: httpStatusCode.unauthorized,
          responseCode: "CLIENT_ERROR",
        });

      // Calculate the difference in seconds
      const differenceInSeconds = expirationTime - currentTime;

      // Check if the difference is more than 300 seconds
      const isDifferenceMoreThan300Seconds = differenceInSeconds > 300;

      if (isDifferenceMoreThan300Seconds)
        return common.failureResponse({
          message: "Please login again!",
          statusCode: httpStatusCode.unauthorized,
          responseCode: "CLIENT_ERROR",
        });

      const token = jwt.sign(
        {
          _id,
          schoolId,
          userType,
        },
        process.env.JWT_PRIVATE_KEY,
        {
          expiresIn: 900,
        }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: token,
      });
    } catch (error) {
      throw error;
    }
  }

  // get current User
  static async checkIfLoggedIn(req) {
    try {
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Is logged in",
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * login user account
   * @method
   * @name login
   * @param {Object} bodyData -request body contains user login deatils.
   * @param {Object} bodyData.userType -request body contains user login deatils.
   * @param {String} bodyData.username - user email.
   * @param {String} bodyData.password - user password.
   * @returns {JSON} - returns susccess or failure of login details.
   */

  static async login(bodyData) {
    try {
      const { username, userType, password, rememberMe, isMobile } = bodyData;

      if (userType === "employee") {
        let employeeExists = await Employee.findOne({
          username: { $regex: new RegExp(`^${username}$`, "i") },
        }).populate(
          "school basicInfo.designation academicInfo.salaryGrade academicInfo.department role"
        );

        if (employeeExists) {
          if (!employeeExists.basicInfo.designation) {
            employeeExists.basicInfo.designation =
              employeeExists.basicInfo.fallbackDesignation;
          }
          if (!employeeExists.academicInfo.salaryGrade) {
            employeeExists.academicInfo.salaryGrade =
              employeeExists.academicInfo.fallbackSalaryGrade;
          }

          if (!employeeExists.academicInfo.department) {
            employeeExists.academicInfo.department =
              employeeExists.academicInfo.fallbbackDepartment;
          }
          if (!employeeExists.role) {
            employeeExists.role = employeeExists.fallbackRole;
          }

          delete employeeExists.fallbackDesignation;
          delete employeeExists.fallbackRole;
          delete employeeExists.fallbbackDepartment;
          delete employeeExists.fallbackSalaryGrade;
        }
        if (!employeeExists)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Username or Password is incorrect!",
            responseCode: "CLIENT_ERROR",
          });

        const isPasswordCorrect = bcryptJs.compareSync(
          password,
          employeeExists.password
        );

        if (!isPasswordCorrect) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Username or Password is incorrect!",
            responseCode: "CLIENT_ERROR",
          });
        }

        let token = "";
        let refreshToken = "";

        if (rememberMe || isMobile) {
          token = await employeeExists.generatePermanentAuthToken();
        } else {
          token = await employeeExists.generateAuthToken();
          refreshToken = await employeeExists.generateRefreshToken();
        }

        await Employee.updateOne(
          { _id: employeeExists._id },
          { $set: { refreshToken } }
        );

        delete employeeExists.password;
        delete employeeExists.refreshToken;

        const result = {
          access_token: token,
          refresh_token: refreshToken,
          user: employeeExists,
          hasCookie: true,
        };

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Logged in successfully!",
          result,
        });
      } else if (userType === "student" || userType === "alumni") {
        let studentExists = await Student.findOne({
          username: { $regex: new RegExp(`^${username}$`, "i") },
        })
          .populate(
            "school academicYear academicInfo.section academicInfo.degreeCode"
          )
          .populate({ path: "transportInfo.route", model: "Route" })
          .populate({ path: "transportInfo.stop", model: "Stop" })
          .populate({ path: "transportInfo.vehicle", model: "Vehicle" })
          .populate("hostelInfo.room")
          .populate({ path: "registeredSubjects", model: "Subject" })
          .populate({
            path: "mentor",
            select: "academicInfo basicInfo",
            populate: [
              {
                path: "academicInfo.department",
              },
              {
                path: "basicInfo.designation",
              },
            ],
          });

        if (!studentExists)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Username or Password is incorrect!",
            responseCode: "CLIENT_ERROR",
          });

        const isPasswordCorrect = password === studentExists.password;

        if (!isPasswordCorrect) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Username or Password is incorrect!",
            responseCode: "CLIENT_ERROR",
          });
        }

        let token = "";

        if (rememberMe || isMobile) {
          token = await studentExists.generatePermanentAuthToken();
        } else {
          token = await studentExists.generateAuthToken();
        }

        delete studentExists.password;
        delete studentExists.plainPassword;

        const result = {
          access_token: token,
          user: studentExists,
          hasCookie: true,
        };

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Logged in successfully!",
          result,
        });
      } else if (userType === "parent") {
        let guardianExists = await Guardian.findOne({
          username: { $regex: new RegExp(`^${username}$`, "i") },
          active: true,
        });

        if (!guardianExists)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Username or Password is incorrect!",
            responseCode: "CLIENT_ERROR",
          });

        const isPasswordCorrect = bcryptJs.compareSync(
          password,
          guardianExists.password
        );

        if (!isPasswordCorrect) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Username or Password is incorrect!",
            responseCode: "CLIENT_ERROR",
          });
        }

        let token = await guardianExists.generateAuthToken();

        delete guardianExists.password;
        delete guardianExists.plainPassword;

        const result = {
          access_token: token,
          user: guardianExists,
          hasCookie: true,
        };

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Logged in successfully!",
          result,
        });
      } else if (userType === "alumni") {
      } else {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid request!",
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentUser(req) {
    try {
      return common.successResponse({
        result: req.employee || req.student,
        statusCode: httpStatusCode.ok,
        message: "Current user information fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * logout user account
   * @method
   * @name logout
   * @param {Object} req -request data.
   * @param {string} bodyData.loggedInId - user id.
   * @param {string} bodyData.refreshToken - refresh token.
   * @returns {JSON} - returns accounts loggedout information.
   */

  static async logout(bodyData) {
    try {
      const user = await usersData.findOne({
        _id: ObjectId(bodyData.loggedInId),
      });
      if (!user) {
        return common.failureResponse({
          message: "USER_DOESNOT_EXISTS",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      const update = {
        $pull: {
          refreshTokens: { token: bodyData.refreshToken },
        },
      };
      /* Destroy refresh token for user */
      const res = await usersData.updateOneUser(
        { _id: ObjectId(user._id) },
        update
      );

      /* If user doc not updated because of stored token does not matched with bodyData.refreshToken */
      if (!res) {
        return common.failureResponse({
          message: "INVALID_REFRESH_TOKEN",
          statusCode: httpStatusCode.unauthorized,
          responseCode: "UNAUTHORIZED",
        });
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "LOGGED_OUT_SUCCESSFULLY",
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * generate token
   * @method
   * @name generateToken
   * @param {Object} bodyData -request data.
   * @param {string} bodyData.refreshToken - refresh token.
   * @returns {JSON} - returns access token info
   */

  static async generateToken(bodyData) {
    let decodedToken;
    try {
      decodedToken = jwt.verify(
        bodyData.refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      /* If refresh token is expired */
      error.statusCode = httpStatusCode.unauthorized;
      error.message = "REFRESH_TOKEN_EXPIRED";
      throw error;
    }

    const user = await usersData.findOne({
      _id: ObjectId(decodedToken.data._id),
    });

    /* Check valid user */
    if (!user) {
      return common.failureResponse({
        message: "USER_DOESNOT_EXISTS",
        statusCode: httpStatusCode.bad_request,
        responseCode: "CLIENT_ERROR",
      });
    }

    /* Check valid refresh token stored in db */
    if (user.refreshTokens.length) {
      const token = user.refreshTokens.find(
        (tokenData) => tokenData.token === bodyData.refreshToken
      );
      if (!token) {
        return common.failureResponse({
          message: "REFRESH_TOKEN_NOT_FOUND",
          statusCode: httpStatusCode.internal_server_error,
          responseCode: "CLIENT_ERROR",
        });
      }

      /* Generate new access token */
      const accessToken = utilsHelper.generateToken(
        { data: decodedToken.data },
        process.env.ACCESS_TOKEN_SECRET,
        common.accessTokenExpiry
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "ACCESS_TOKEN_GENERATED_SUCCESSFULLY",
        result: { access_token: accessToken },
      });
    }
    return common.failureResponse({
      message: "REFRESH_TOKEN_NOT_FOUND",
      statusCode: httpStatusCode.bad_request,
      responseCode: "CLIENT_ERROR",
    });
  }

  /**
   * generate otp
   * @method
   * @name generateOtp
   * @param {Object} bodyData -request data.
   * @param {string} bodyData.email - user email.
   * @param {string} bodyData.password - user email.
   * @returns {JSON} - returns otp success response
   */

  static async generateOtp(bodyData) {
    try {
      let otp;
      let isValidOtpExist = true;
      const user = await usersData.findOne({ "email.address": bodyData.email });
      if (!user) {
        return common.failureResponse({
          message: "USER_DOESNOT_EXISTS",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      const userData = await utilsHelper.redisGet(bodyData.email.toLowerCase());

      if (userData && userData.action === "forgetpassword") {
        otp = userData.otp; // If valid then get previuosly generated otp
        console.log(otp);
      } else {
        isValidOtpExist = false;
      }

      // console.log("user.password",user.password);
      const isPasswordCorrect = bcryptJs.compareSync(
        bodyData.password,
        user.password
      );
      console.log("isPasswordCorrect", isPasswordCorrect);
      if (isPasswordCorrect) {
        return common.failureResponse({
          message: "RESET_PREVIOUS_PASSWORD",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      if (!isValidOtpExist) {
        otp = Math.floor(Math.random() * 900000 + 100000); // 6 digit otp
        const redisData = {
          verify: bodyData.email.toLowerCase(),
          action: "forgetpassword",
          otp,
        };
        const res = await utilsHelper.redisSet(
          bodyData.email.toLowerCase(),
          redisData,
          common.otpExpirationTime
        );
        if (res !== "OK") {
          return common.failureResponse({
            message: "UNABLE_TO_SEND_OTP",
            statusCode: httpStatusCode.internal_server_error,
            responseCode: "SERVER_ERROR",
          });
        }
      }

      let smsInfo2 = await notifications.sendSms({
        to: bodyData.mobile,
        message: utilsHelper.composeEmailBody(common.FORGOT_OTP, {
          name: bodyData.name,
          otp,
        }),
        template_id: process.env.FORGOT_OTP_TEMPLATE_ID,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "OTP_SENT_SUCCESSFULLY",
        result: {
          otp: otp,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password
   * @method
   * @name resetPassword
   * @param {Object} req -request data.
   * @param {string} bodyData.email - user email.
   * @param {string} bodyData.otp - user otp.
   * @param {string} bodyData.password - user password.
   * @returns {JSON} - returns password reset response
   */

  static async resetPassword(bodyData) {
    const projection = {
      refreshTokens: 0,
      "designation.deleted": 0,
      "designation._id": 0,
      "areasOfExpertise.deleted": 0,
      "areasOfExpertise._id": 0,
      "location.deleted": 0,
      "location._id": 0,
    };
    try {
      let user = await usersData.findOne(
        { "email.address": bodyData.email },
        projection
      );
      if (!user) {
        return common.failureResponse({
          message: "USER_DOESNOT_EXISTS",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      const redisData = await utilsHelper.redisGet(
        bodyData.email.toLowerCase()
      );
      if (!redisData || redisData.otp != bodyData.otp) {
        return common.failureResponse({
          message: "RESET_OTP_INVALID",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
      const isPasswordCorrect = bcryptJs.compareSync(
        bodyData.password,
        user.password
      );
      if (isPasswordCorrect) {
        return common.failureResponse({
          message: "RESET_PREVIOUS_PASSWORD",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      const salt = bcryptJs.genSaltSync(10);
      bodyData.password = bcryptJs.hashSync(bodyData.password, salt);

      const tokenDetail = {
        data: {
          _id: user._id,
          email: user.email.address,
          name: user.name,
          isAMentor: user.isAMentor,
        },
      };

      const accessToken = utilsHelper.generateToken(
        tokenDetail,
        process.env.ACCESS_TOKEN_SECRET,
        "1d"
      );
      const refreshToken = utilsHelper.generateToken(
        tokenDetail,
        process.env.REFRESH_TOKEN_SECRET,
        "183d"
      );

      const updateParams = {
        $push: {
          refreshTokens: {
            token: refreshToken,
            exp: new Date().getTime() + common.refreshTokenExpiryInMs,
          },
        },
        lastLoggedInAt: new Date().getTime(),
        password: bodyData.password,
      };
      await usersData.updateOneUser({ _id: user._id }, updateParams);

      await utilsHelper.redisDel(bodyData.email.toLowerCase());

      /* Mongoose schema is in strict mode, so can not delete otpInfo directly */
      delete user.password;
      delete user.otpInfo;

      const result = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user,
      };

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "PASSWORD_RESET_SUCCESSFULLY",
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(req) {
    try {
      const { oldPassword, newPassword } = req.body;
      let userType = req.employee ? "employee" : "student";

      if (userType === "employee") {
        let employee = await Employee.findOne({ _id: req.employee._id }).select(
          "+plainPassword"
        );
        const isPasswordCorrect = bcryptJs.compareSync(
          oldPassword,
          employee.password
        );
        if (!isPasswordCorrect) {
          return common.failureResponse({
            message: "Please provide correct current password",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });
        }

        const salt = bcryptJs.genSaltSync(10);
        let updatedPassword = bcryptJs.hashSync(newPassword, salt);
        await employeeQuery.updateOne(
          { _id: employee._id },
          { $set: { password: updatedPassword, plainPassword: newPassword } }
        );
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Password changed successfully",
        });
      } else {
        if (req.student.password !== oldPassword)
          return common.successResponse({
            statusCode: httpStatusCode.ok,
            message: "Please provide correct current password",
            responseCode: "CLIENT_ERROR",
          });
        await Student.updateOne(
          { _id: req.student._id },
          { $set: { password: newPassword } }
        );
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Password changed successfully",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async changePasswordForUser(req) {
    try {
      const { password, employeeId, userType, studentId } = req.body;

      if (!["employee", "student"].includes(userType))
        return common.failureResponse({
          message: "Invalid user type can only be employee || student",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      if (userType === "employee") {
        let employeeExists = await Employee.findOne({ _id: employeeId });
        if (!employeeExists)
          return common.failureResponse({
            message: "USER_DOESNOT_EXISTS",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });

        employeeExists.password = password;

        await employeeExists.save();
      } else {
        let studentExists = await Student.findOne({ _id: studentId });
        if (!studentExists)
          return common.failureResponse({
            message: "Student does not exist",
            statusCode: httpStatusCode.bad_request,
            responseCode: "CLIENT_ERROR",
          });

        await Student.findOneAndUpdate(
          { _id: studentId },
          { $set: { password: password } }
        );
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message:
          userType === "employee"
            ? "Employee password changed successfully"
            : "Student password changed successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
