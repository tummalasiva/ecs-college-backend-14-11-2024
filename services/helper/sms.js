const smsQuery = require("@db/sms/queries");
const studentQuery = require("@db/student/queries");
const employeeQuery = require("@db/employee/queries");
const academicYearQuery = require("@db/academicYear/queries");
const Student = require("@db/student/model");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const {
  getDeliveryStatus,
  sendSms,
  getSmsBalance,
} = require("../../sms-service/smsService");

const puppeteer = require("puppeteer");
const path = require("path");

const { smsService } = require("../../constants/constants");
const { compileTemplate } = require("../../helper/helpers");
const { default: mongoose } = require("mongoose");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const mime = require("mime-types");
const moment = require("moment");
const agenda = require("../../lib/agenda");

const randomNumberRange = (min, max) => {
  const random = Math.random();
  return Math.floor(random * (max - min) + min);
};

module.exports = class SmsService {
  static async updateSmsbackup(req) {
    try {
      const id = req.params.id;
      const smsSent = await smsQuery.findOne({ _id: id });

      if (smsSent && smsSent.messageDetails.length) {
        const updateTasks = smsSent.messageDetails.map(async (sms) => {
          const report = await getDeliveryStatus(sms.messageid);
          if (report.status === 200 && report.data[0]?.deliverystatus) {
            const deliveryStatus = report.data[0].deliverystatus || "NA";
            return smsQuery.updateOne(
              { _id: id, "messageDetails.messageid": sms.messageid },
              {
                $set: { "messageDetails.$.deliveryStatus": deliveryStatus },
                $inc: {
                  totalBlocked: deliveryStatus === "BLOCKED" ? 1 : 0,
                  totalRejected: deliveryStatus === "REJECTD" ? 1 : 0,
                  totalDelivered: deliveryStatus === "DELIVRD" ? 1 : 0,
                  totalWaiting: deliveryStatus ? -1 : 0,
                },
              }
            );
          }
        });

        await Promise.all(updateTasks);
      }

      return common.successResponse({
        message: "Report updated successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  // update sms from webhook;
  static async updateSmsStatus(req) {
    let deliveryStatus = req.body[0].errorstatus;

    if (!req.body[0].errorstatus)
      return common.successResponse({
        message: "Delivery Status was empty!",
        statusCode: httpStatusCode.ok,
      });
    try {
      let sms = await smsQuery.updateOne(
        { "messageDetails.messageid": req.body[0].messageid },
        {
          $set: {
            "messageDetails.$.deliveryStatus": req.body[0].errorstatus
              ? req.body[0].errorstatus
              : "Delivery report not available",
          },
          $inc: {
            totalBlocked: deliveryStatus === "BLOCKED" ? 1 : 0,
            totalRejected: deliveryStatus === "REJECTD" ? 1 : 0,
            totalDelivered: deliveryStatus === "DELIVRD" ? 1 : 0,
            totalWaiting: deliveryStatus ? -1 : 0,
          },
        },
        { new: true }
      );
    } catch (error) {
      console.log(error);
    }
    return common.successResponse({
      statusCode: httpStatusCode.ok,
    });
  }

  static async sendStudentCredentials(req) {
    try {
      const { studentIds } = req.body;
      const students = await Student.find({
        _id: { $in: studentIds },
        active: true,
      })
        .populate("academicInfo.class academicInfo.section")
        .lean();

      if (!students.length) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Students not found!",
          responseCode: "CLIENT_ERROR",
        });
      }

      const updatedStudents = await Promise.all(
        students.map(async (student) => {
          if (!student.username) {
            student.username = `${
              process.env.USERNAME_SUCCESSOR
            }_${randomNumberRange(10000000, 99999999)}`;
            student.password = student.contactNumber;
            await Student.updateOne(
              { _id: student._id },
              { username: student.username, password: student.password }
            );
          }
          return student;
        })
      );

      const messageId = new mongoose.Types.ObjectId();
      const smsTasks = updatedStudents.map(async (student) => {
        const message = `Dear ${student.basicInfo.name},\nWe would like to inform you your Login Credential for School Academic Management System\nUsername: ${student.username}\nPassword: ${student.password}\nLink: https://excellentschool.in/app\nRegards\nEXCELLENT SCHOOL VIJAYAPURA.`;
        const response = await sendSms(message, [
          student.contactNumber.toString(),
        ]);
        const messageDetail = { ...response.data.smslist.sms };

        const recipient = {
          name: student.basicInfo?.name,
          contactNumber: `+91${student.contactNumber}`,
          class: student.academicInfo?.class?.name,
          section: student.academicInfo?.section?.name,
        };

        await smsQuery.updateOne(
          { _id: messageId },
          {
            $set: {
              notifyRecipients: false,
              message: `Dear [Student's Name],\nWe would like to inform you your Login Credential for School Academic Management System\nUsername: [Student's Username]\nPassword: [Student's Password]\nLink: https://excellentschool.in/app\nRegards\nEXCELLENT SCHOOL VIJAYAPURA.`,
              smsCategory: "Login Credential",
              smsSubject: "Student Credentials sent.",
              smsType: "Automatic",
            },
            $addToSet: {
              receipients: recipient,
              messageDetails: messageDetail,
            },
            $inc: { totalMessagesSent: 1, totalWaiting: 1 },
          },
          { upsert: true }
        );
      });

      await Promise.all(smsTasks);

      return common.successResponse({
        message: "Student credentials sent successfully!",
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAllSms(req) {
    try {
      const { search = {} } = req.query;
      let filter = typeof search === "string" ? JSON.parse(search) : search;
      const sms = await smsQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Sms list are fetched successfully!!!",
        result: sms,
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteSms(req) {
    try {
      const { id: smsId } = req.params;
      const delSms = await smsQuery.delete({ _id: smsId });
      if (!delSms)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Sms not found",
        });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        msg: "Sms is deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async sendSmsToRole(req) {
    try {
      if (!Array.isArray(req.body.roles)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Roles should be an array",
        });
      }

      const users = await employeeQuery.findAll({
        role: { $in: req.body.roles },
        school: req.schoolId,
        active: true,
      });

      if (!users.length) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No users found for the given roles",
        });
      }

      const recipients = users.map((user) => ({
        name: user.basicInfo?.name,
        contactNumber: `+91${user.contactNumber}`,
        section: "NA",
        class: "NA",
      }));

      const messageId = new mongoose.Types.ObjectId();
      const smsTasks = recipients.map(async (recipient) => {
        const smsSent = await sendSms(req.body.message, [
          recipient.contactNumber.substring(3),
        ]);
        return smsQuery.updateOne(
          { _id: messageId },
          {
            $set: {
              smsType: "manual",
              smsCategory: req.body.smsCategory,
              smsSubject: req.body.subject,
              message: req.body.message,
              notifyRecipients: req.body.notify,
            },
            $addToSet: {
              messageDetails: smsSent.data.smslist.sms,
              recipients: recipient,
            },
            $inc: { totalMessagesSent: 1, totalWaiting: 1 },
          },
          { upsert: true }
        );
      });

      await Promise.all(smsTasks);

      // const usersWithPushToken = await employeeQuery
      //     .findAll({
      //         role: { $in: req.body.roles },
      //         expoPushToken: { $ne: null },
      //     })

      // const allTokens = usersWithPushToken.map(e => e.expoPushToken);

      // if (allTokens.length) {
      //     setTimeout(async () => {
      //         await sendPushNotificationToMany(
      //             allTokens,
      //             {
      //                 title: req.body.subject,
      //                 body: req.body.message,
      //             },
      //             "Communications"
      //         );
      //     }, 2000);
      // }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Sms is sent successfully!!!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async sendSmsToSingle(req) {
    try {
      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found",
        });
      }

      if (!Array.isArray(req.body.numbers)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No numbers in array",
        });
      }

      const recipientTasks = req.body.numbers.map(async (number) => {
        const student = await studentQuery.findOne({
          school: req.schoolId,
          contactNumber: number,
          academicYear: currentAcademicYear._id,
          active: true,
        });

        const emp = await employeeQuery.findOne({
          contactNumber: number,
          active: true,
          school: req.schoolId,
        });

        if (student) {
          return {
            expoPushToken: student.expoPushToken,
            name: student.basicInfo?.name,
            contactNumber: `+91${student.contactNumber}`,
            class: student.academicInfo.class?.name,
            section: student.academicInfo?.section?.name,
          };
        } else if (emp) {
          return {
            expoPushToken: emp.expoPushToken,
            name: emp.basicInfo?.name,
            contactNumber: `+91${emp.contactNumber}`,
            class: "NA",
            section: "NA",
          };
        } else {
          return {
            expoPushToken: null,
            name: "NA",
            contactNumber: `+91${number}`,
            class: "NA",
            section: "NA",
          };
        }
      });

      const recipients = await Promise.all(recipientTasks);

      const messageId = new mongoose.Types.ObjectId();

      const smsTasks = recipients.map(async (recipient) => {
        const smsSent = await sendSms(req.body.message, [
          recipient.contactNumber.substring(3),
        ]);

        return smsQuery.updateOne(
          { _id: messageId },
          {
            $set: {
              smsType: "manual",
              smsCategory: req.body.smsCategory,
              smsSubject: req.body.subject,
              message: req.body.message,
              notifyRecipients: req.body.notify,
            },
            $addToSet: {
              messageDetails: smsSent.data.smslist.sms,
              recipients: recipient,
            },
            $inc: { totalMessagesSent: 1, totalWaiting: 1 },
          },
          { upsert: true }
        );
      });

      await Promise.all(smsTasks);

      // agenda.schedule("4 hours", "updateSmsStatus", { id: messageId });

      const allTokens = recipients
        .filter((r) => r.expoPushToken != null)
        .map((r) => r.expoPushToken);

      if (allTokens.length) {
        setTimeout(async () => {
          await sendPushNotificationToMany(
            allTokens,
            {
              title: req.body.subject,
              body: req.body.message,
            },
            "Communications"
          );
        }, 2000);
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Sms is sent successfully!!!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async sendSmsToStudents(req) {
    try {
      const academicYear = await academicYearQuery.findOne({ active: true });
      if (!academicYear) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found",
        });
      }

      const students = await studentQuery.findAll({
        academicYear: academicYear._id,
        active: true,
      });

      if (!students.length) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "No active students found for the current academic year",
        });
      }

      const recipients = students.map((student) => ({
        name: student.basicInfo.name,
        contactNumber: `+91${student.contactNumber}`,
        class: student.academicInfo.class.name,
        section: student.academicInfo.section?.name || "NA",
      }));

      const messageId = new mongoose.Types.ObjectId();

      const smsTasks = recipients.map(async (recipient) => {
        const smsSent = await sendSms(req.body.message, [
          recipient.contactNumber.substring(3),
        ]);
        return smsQuery.updateOne(
          { _id: messageId },
          {
            $set: {
              smsType: "manual",
              smsCategory: req.body.smsCategory,
              smsSubject: req.body.subject,
              message: req.body.message,
              notifyRecipients: req.body.notify,
            },
            $addToSet: {
              messageDetails: smsSent.data.smslist.sms,
              receipients: recipient,
            },
            $inc: { totalMessagesSent: 1, totalWaiting: 1 },
          },
          { upsert: true }
        );
      });

      await Promise.all(smsTasks);

      agenda.schedule("4 hours", "updateSmsStatus", { id: messageId });

      const studentsWithPushTokens = await studentQuery.findAll({
        academicYear: academicYear._id,
        active: true,
        expoPushToken: { $ne: null },
      });

      const allTokens = studentsWithPushTokens.map(
        (student) => student.expoPushToken
      );

      if (allTokens.length) {
        setTimeout(async () => {
          await sendPushNotificationToMany(
            allTokens,
            {
              title: req.body.subject,
              body: req.body.message,
            },
            "Communications"
          );
        }, 2000);
      }

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Sms is sent successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async sendEmployeesCredentials(req) {
    try {
      const employees = await employeeQuery.findAll({
        _id: { $in: req.body.employees },
        active: true,
      });

      if (!employees.length) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "No active employees found for the given IDs",
        });
      }

      const recipients = employees.map((emp) => ({
        name: emp.basicInfo.name,
        contactNumber: `+91${emp.contactNumber}`,
        class: "NA",
        section: "NA",
        username: emp.username,
        password: emp.plainPassword,
      }));

      const messageId = new mongoose.Types.ObjectId();

      const smsTasks = recipients.map(async (recipient) => {
        const message = smsService.automaticSms.empLoginCred.message(
          recipient.name,
          recipient.username,
          recipient.password
        );

        const smsSent = await sendSms(message, [
          recipient.contactNumber.substring(3),
        ]);

        return smsQuery.updateOne(
          { _id: messageId },
          {
            $set: {
              smsType: smsService.automaticSms.empLoginCred.type,
              smsCategory: req.body.smsCategory,
              smsSubject: smsService.automaticSms.empLoginCred.subject,
              message: smsService.automaticSms.empLoginCred.template,
              notifyRecipients: req.body.notify,
            },
            $addToSet: {
              messageDetails: smsSent.data.smslist.sms,
              recipients: recipient,
            },
            $inc: { totalMessagesSent: 1, totalWaiting: 1 },
          },
          { upsert: true }
        );
      });

      await Promise.all(smsTasks);

      agenda.schedule("4 hours", "updateSmsStatus", { id: messageId });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Credentials have been sent successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  static async sendBulkSms(req) {
    try {
      if (!req.files || !req.files.file)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No file uploaded",
          responseCode: "CLIENT_ERROR",
        });

      const validMimeTypes = [
        "application/vnd.oasis.opendocument.spreadsheet",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "application/vnd.ms-excel",
      ];

      if (!validMimeTypes.includes(req.files.file.mimetype)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Invalid file format. Please upload a valid Excel file.",
          responseCode: "CLIENT_ERROR",
        });
      }

      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });
      if (!currentAcademicYear) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found.",
          responseCode: "CLIENT_ERROR",
        });
      }

      const sheetData = xlsx.read(req.files.file.buffer);
      const data = sheetData.SheetNames.reduce((acc, sheet) => {
        const sheetJson = xlsx.utils.sheet_to_json(sheetData.Sheets[sheet]);
        return acc.concat(sheetJson);
      }, []);

      if (!data.length) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No data found in the uploaded file.",
          responseCode: "CLIENT_ERROR",
        });
      }

      const contactNumbers = data.map((item) => item.Number.toString());

      const recipients = await Promise.all(
        contactNumbers.map(async (number) => {
          const [student, emp] = await Promise.all([
            studentQuery.findOne({
              contactNumber: number,
              academicYear: currentAcademicYear._id,
              active: true,
              school: req.schoolId,
            }),
            employeeQuery.findOne({
              contactNumber: number,
              active: true,
              school: req.schoolId,
            }),
          ]);

          if (student) {
            return {
              name: student.basicInfo.name,
              contactNumber: `+91${student.contactNumber}`,
              class: student.academicInfo?.class?.name || "NA",
              section: student.academicInfo?.section?.name || "NA",
            };
          } else if (emp) {
            return {
              name: emp.basicInfo?.name || "NA",
              contactNumber: `+91${emp.contactNumber}`,
              class: "NA",
              section: "NA",
            };
          } else {
            return {
              name: "NA",
              contactNumber: `+91${number}`,
              class: "NA",
              section: "NA",
            };
          }
        })
      );

      const messageId = new mongoose.Types.ObjectId();

      const smsTasks = recipients.map(async (recipient) => {
        const smsSent = await sendSms(req.body.message, [
          recipient.contactNumber.substring(3),
        ]);

        return smsQuery.updateOne(
          { _id: messageId },
          {
            $set: {
              smsType: "manual",
              smsCategory: req.body.smsCategory,
              smsSubject: req.body.subject,
              message: req.body.message,
              notifyRecipients: req.body.notify,
            },
            $addToSet: {
              messageDetails: smsSent.data.smslist.sms,
              recipients: recipient,
            },
            $inc: { totalMessagesSent: 1, totalWaiting: 1 },
          },
          { upsert: true }
        );
      });

      await Promise.all(smsTasks);

      agenda.schedule("4 hours", "updateSmsStatus", { id: messageId });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Sms is sent successfully!!!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async getSmsSample(req) {
    try {
      const filePath = path.join(
        __dirname,
        "../templates/sheet",
        "bulk_sms_upload.xlsx"
      );
      const fileContent = fs.readFileSync(filePath);
      const fileMimeType = mime.getType(filePath);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Sample bulk SMS upload template is downloaded successfully!",
        result: fileContent,
        meta: {
          "Content-Type": fileMimeType,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getBalance(req) {
    try {
      const smsBalance = await getSmsBalance();
      return common.successResponse({
        result: smsBalance.data,
        statusCode: httpStatusCode.ok,
        message: "Sms balance fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async getDeliveryReport(req) {
    try {
      const messageId = req.params.id;
      const report = await getDeliveryStatus(messageId);
      let sms = await smsQuery.updateOne(
        { "messageDetails.messageid": messageId },
        {
          $set: {
            "messageDetails.$.deliveryStatus": report.data[0]?.deliverystatus,
          },
        },
        { new: true }
      );

      return common.successResponse({
        result: report.data,
        statucCode: httpStatusCode.ok,
        message: "Delivery report fetched successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async smsReport(req, res) {
    try {
      const { id: smsId } = req.params;
      const sms = await smsQuery.findOne({ _id: smsId });

      if (!sms) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No SMS found with this ID.",
        });
      }

      const currentAcademicYear = await academicYearQuery.findOne({
        active: true,
      });

      if (!currentAcademicYear) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No active academic year found.",
        });
      }

      const recipients = await Promise.all(
        sms.recipients.map(async (recipient) => {
          const contactNumber = recipient.contactNumber.substring(3);
          const student = await studentQuery.findOne({
            contactNumber,
            academicYear: currentAcademicYear._id,
            active: true,
            school: req.schoolId,
          });

          const employee = await employeeQuery.findOne({
            contactNumber,
            active: true,
            school: req.schoolId,
          });

          if (student) {
            return {
              name: student.basicInfo.name,
              contactNumber: recipient.contactNumber,
              class: student.academicInfo.class?.name,
              section: student.academicInfo.section?.name || "NA",
            };
          } else if (employee) {
            return {
              name: employee.basicInfo.name,
              contactNumber: recipient.contactNumber,
              class: "NA",
              section: "NA",
            };
          } else {
            return {
              name: "Unknown",
              contactNumber: recipient.contactNumber,
              class: "NA",
              section: "NA",
            };
          }
        })
      );

      const messageStatus = sms.messageDetails.map((status) => {
        const recipient = recipients.find(
          (r) => r.contactNumber === status.mobileno
        );
        return {
          ...status,
          deliveryStatus: status.deliveryStatus || "NA",
          receiverClass: recipient ? recipient.class : "NA",
          receiverSection: recipient ? recipient.section : "NA",
          receiverName: recipient ? recipient.name : "Unknown",
        };
      });

      const newSms = { ...sms.toObject(), messageStatus };

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
      const content = await compileTemplate("sms-status", { sms: newSms });
      await page.setContent(content);
      await page.addScriptTag({
        path: path.join(__dirname, "static", "xlsx.full.min.js"),
      });

      const xlsxFile = await page.evaluate(() => {
        const table = document.querySelector("table");
        const workbook = XLSX.utils.table_to_book(table);
        return XLSX.write(workbook, { type: "binary", bookType: "xlsx" });
      });

      await browser.close();
      const bufferXlsx = Buffer.from(xlsxFile, "binary");

      return common.successResponse({
        result: bufferXlsx,
        statusCode: httpStatusCode.ok,
        message: "SMS report generated successfully!",
        meta: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async reSendFailedSms(req) {
    try {
      const { id: smsId } = req.params;
      const sms = await smsQuery.findOne({ _id: smsId });

      if (!sms) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No SMS found with this ID.",
        });
      }

      const failedRecipients = sms.messageDetails.filter((status) =>
        ["UNDELIV", "REJECTD", "EXPIRED"].includes(status.deliveryStatus)
      );

      if (failedRecipients.length === 0) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No failed messages found to re-send!",
        });
      }

      const messageId = new mongoose.Types.ObjectId();
      const sendingPromises = [];

      for (const status of failedRecipients) {
        const recipient = sms.recipients.find(
          (r) => r.contactNumber === status.mobileno
        );

        if (recipient) {
          sendingPromises.push(
            sendSms(sms.message, [recipient.contactNumber.substring(3)])
              .then(async (smsSent) => {
                await smsQuery.updateOne(
                  { _id: messageId },
                  {
                    $set: {
                      smsType: "manual",
                      smsSubject: `Resend: ${sms.smsSubject}`,
                      message: sms.message,
                      notifyRecipients: sms.notifyRecipients,
                      smsCategory: sms.smsCategory,
                    },
                    $addToSet: {
                      messageDetails: smsSent.data.smslist.sms,
                      recipients: recipient,
                    },
                    $inc: { totalMessagesSent: 1, totalWaiting: 1 },
                  },
                  { upsert: true }
                );
              })
              .catch((error) => {
                console.error(
                  `Error sending SMS to ${recipient.contactNumber}: ${error.message}`
                );
              })
          );
        }
      }

      await Promise.all(sendingPromises);

      agenda.schedule("4 hours", "updateSmsStatus", { id: messageId });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "SMS re-send initiated successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async sendOtp(req) {
    try {
      const student = await studentQuery.findOne({ _id: req.params.id });
      if (!student) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "No student found with this ID.",
          responseCode: "CLIENT_ERROR",
        });
      }

      let otp = Math.floor(100000 + Math.random() * 900000);
      const message = `Dear Parent, We would like to inform you, the OTP to verify your ward checkout is ${otp}. Regards EXCELLENT SCHOOL VIJAYAPURA.`;

      const recipient = {
        name: student.basicInfo.name,
        contactNumber: `+91${student.contactNumber}`,
        class: student.academicInfo?.class?.name,
        section: student.academicInfo?.section?.name || "NA",
      };

      const messageId = new mongoose.Types.ObjectId();

      const sentSms = await sendSms(message, [
        student.contactNumber.toString(),
      ]);

      if (sentSms.status === 200) {
        await smsQuery.updateOne(
          { _id: messageId },
          {
            $set: {
              smsType: "manual",
              smsCategory: "Checkout",
              smsSubject: "Student Checkout",
              message: message,
            },
            $addToSet: {
              messageDetails: sentSms.data.smslist.sms,
              recipients: recipient,
            },
            $inc: { totalMessagesSent: 1, totalWaiting: 1 },
          },
          { upsert: true }
        );

        await studentQuery.updateOne(
          { _id: student._id },
          {
            $set: {
              verificationOtp: otp,
              otpExpiry: moment(Date.now()).add(3, "minutes"),
            },
          }
        );

        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "OTP sent successfully!",
        });
      } else {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Failed to send OTP. Please try again later.",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async updateSeenStatus(req) {
    try {
      const { search = {} } = req.body;
      let updatedSms = await smsQuery.updateMany(search, {
        $set: { seen: true },
      });
      return common.successResponse({
        result: updatedSms,
        statucCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }
};
