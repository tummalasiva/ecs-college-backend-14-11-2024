const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const hbs = require("handlebars");
const {
  scryptSync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} = require("crypto");
const brcrypt = require("bcrypt");
const moment = require("moment");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

const algo = "aes-192-cbc";
const passwordHashSecretKey = "webspruce";
const iv = randomBytes(16);
const key = scryptSync(passwordHashSecretKey, "salt", 24);
const storageQuery = require("@db/storage/queries");
const axios = require("axios");

// aws

const aws = require("aws-sdk");

let config = {
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Create an S3 client
const s3Client = new aws.S3(config);

async function uploadFileToS3(file) {
  console.log(file, "file");
  try {
    let storage = await storageQuery.findOne({});
    if (!storage) {
      await storageQuery.create({});
    }

    storage = await storageQuery.findOne({});

    if (file.size + storage.usedStorage > storage.totalStorage) {
      throw new Error("Storage limit exceeded!");
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.name,
      Body: file.data,
      ContentType: file.mimetype,
    };
    const result = await s3Client.upload(params).promise();
    await storageQuery.updateOne(
      {},
      { $inc: { usedStorage: Number(file.size), totalFilesUploaded: 1 } }
    );
    return result.Location;
  } catch (error) {
    throw error;
  }
}

async function deleteFile(file) {
  let url = file;
  let parts = url.split("/");
  let key = parts[parts.length - 1];
  let decodedKey = decodeURIComponent(key);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: decodedKey,
  };

  try {
    // const fileSize = await getFileSizeFromS3Url(file);

    // let storage = await storageQuery.findOne({});

    s3Client.deleteObject(params, async (err, data) => {
      if (err) {
        throw err;
      } else {
        // await storageQuery.updateOne(
        //   {},
        //   { $inc: { usedStorage: -fileSize, totalFilesDeleted: 1 } }
        // );

        console.log("File deleted successfully:", data);
      }
    });
  } catch (error) {
    throw error;
  }
}

async function getFileSizeFromS3Url(fileUrl) {
  try {
    const response = await axios.head(fileUrl);
    const fileSize = response.headers["content-length"];
    return fileSize;
  } catch (error) {
    console.error("Error retrieving file size:", error.message);
    throw error;
  }
}

function convertBytesToHumanReadableSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;

  while (size >= 1024 && i < sizes.length - 1) {
    size /= 1024;
    i++;
  }

  return `${size.toFixed(2)} ${sizes[i]}`;
}

// db
//  const Grade = require('../../db/examGrade/model');

const multerConfig = () => {
  const upload = multer({
    limits: {
      fileSize: 10000000,
    },
    fileFilter(req, file, cb) {
      if (
        !file.originalname.endsWith(".jpg") ||
        !file.originalname.endsWith(".png")
      ) {
      }
      cb(undefined, true);
    },
  });
  return upload;
};
const compileTemplate = async (templateName, data) => {
  const filePath = path.join(process.cwd(), "templates", `${templateName}.hbs`);

  const html = await fs.readFile(filePath, "utf8");

  hbs.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
  });
  hbs.registerHelper("ifStr", function (a, b, options) {
    if (a == b) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  hbs.registerHelper("dateFormat", function (date, options) {
    return moment(date).format("DD-MM-YYYY");
  });
  hbs.registerHelper("timeFormat", function (time, options) {
    return moment(Date.now())
      .set("hour", time.split(":")[0])
      .set("minutes", time.split(":")[1])
      .format("h:mm A");
  });
  return hbs.compile(html)(data);
};

const hashing = (userPassword) => {
  try {
    const hashedPassword = brcrypt.hashSync(userPassword, 7);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};
const hashVerfiy = (userPassword, hashedPassword) => {
  return brcrypt.compareSync(userPassword, hashedPassword);
};

function getGrade(maxMarks, marks, grades) {
  const percentage = (marks / maxMarks) * 100;
  for (let i = 0; i < grades.length; i++) {
    if (percentage >= grades[i].markFrom && percentage <= grades[i].markTo)
      return grades[i];
  }
  return "";
}

const getMonthStartAndEndDate = (year, month) => {
  if (!moment.months().includes(month))
    throw new Error(`${month} is not valid month`);
  return {
    startDate: moment(moment(year).month(month))
      .startOf("month")
      .format("YYYY-MM-DD"),
    endDate: moment(moment(year).month(month))
      .endOf("month")
      .format("YYYY-MM-DD"),
  };
};
function marksCompresser(
  compressSubjects,
  subjectName,
  writtenMarks,
  maxMarks,
  defaultCompress
) {
  const subject =
    Array.isArray(compressSubjects) &&
    compressSubjects.length > 0 &&
    compressSubjects.find(({ subject }) => subject === subjectName);
  if (subject && subject.compress) {
    const div = writtenMarks / maxMarks;
    const compress = div * subject.compress;
    const multiplier = Math.pow(10, 2);
    return Math.round(compress * multiplier) / multiplier;
  } else {
    const div = writtenMarks / maxMarks;
    const compress = div * defaultCompress;
    const multiplier = Math.pow(10, 2);
    return Math.round(compress * multiplier) / multiplier;
  }
}
function marksCompressRateGiver(
  subjectName,
  compressSubjects,
  defaultCompress
) {
  const subject =
    Array.isArray(compressSubjects) &&
    compressSubjects.length > 0 &&
    compressSubjects.find(({ subject }) => subject === subjectName);
  if (subject && subject.compress) return subject.compress;
  return Number(defaultCompress);
}

// Function to traverse and retrieve required paths from nested schemas
const getRequiredPaths = (schema) => {
  let requiredPaths = [];
  const paths = schema.paths;

  for (const path in paths) {
    if (paths[path].isRequired) {
      requiredPaths.push(path);
    }
  }

  return requiredPaths;
};

// Function to create middleware for validating required fields
const createRequiredFieldsMiddleware = (schema) => {
  const requiredPaths = getRequiredPaths(schema);

  return function validateRequiredFields(next) {
    const update = this.getUpdate ? this.getUpdate() : null;
    const subject = this;
    let missingFields = [];

    // Check for required fields in subject document
    requiredPaths.forEach((path) => {
      if (!subject[path]) {
        missingFields.push(path);
      }
    });

    // Check for required fields in update object (for update operations)
    if (update && update.$set) {
      const updatedFields = Object.keys(update.$set);
      requiredPaths.forEach((path) => {
        if (!updatedFields.includes(path)) {
          missingFields.push(path);
        }
      });
    }

    // If any required field is missing, throw an error
    if (missingFields.length > 0) {
      throw Error(`Missing required field(s): ${missingFields.join(", ")}`);
    }

    // If all required fields are present, proceed
    next();
  };
};

function getDateRange(fromDate, toDate) {
  const startOfDay = new Date(fromDate);
  startOfDay.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for the start date

  // For the end date, we want the start of the day after 'toDate'
  const endOfDay = new Date(toDate);
  endOfDay.setDate(endOfDay.getDate() + 1); // Increment the day by 1 to get the day after 'toDate'
  endOfDay.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for the end date

  return { startOfDay, endOfDay };
}

const getDateWithTime = (dateTimeString = "27/09/2024 14:30") => {
  const dateTimeComponents = dateTimeString.split(" ");

  // Extract date components
  const dateComponents = dateTimeComponents[0].split("/");
  const yearExtracted = parseInt(dateComponents[2], 10);
  const monthExtracted = parseInt(dateComponents[1], 10) - 1; // Months are zero-based
  const dayExtracted = parseInt(dateComponents[0], 10);

  // Extract time components
  const timeComponents = dateTimeComponents[1].split(":");
  const hoursExtracted = parseInt(timeComponents[0], 10);
  const minutesExtracted = parseInt(timeComponents[1], 10);

  // Create a new Date object using the extracted components
  return new Date(
    yearExtracted,
    monthExtracted,
    dayExtracted,
    hoursExtracted,
    minutesExtracted
  );
};

function randomID(len) {
  let result = "";
  if (result) return result;
  var chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

const getMonthStartAndEndMonth = (year) => {
  const academicYearFromStart = moment(moment(year).month("June"))
    .startOf("month")
    .format("YYYY-MM-DD");
  const academicYearToStart = moment(moment(year).month("May"))
    .startOf("month")
    .format("YYYY-MM-DD");

  const academicYearFromEnd = moment(moment(year).month("May"))
    .endOf("month")
    .format("YYYY-MM-DD");
  const academicYearToEnd = moment(moment(year).month("June"))
    .endOf("month")
    .format("YYYY-MM-DD");

  return {
    academicYearFromStart,
    academicYearToStart,
    academicYearFromEnd,
    academicYearToEnd,
  };
};

const notFoundError = (message) =>
  common.failureResponse({
    statusCode: httpStatusCode.not_found,
    message,
    responseCode: "CLIENT_ERROR",
  });

function getGrade(maxMarks, marks, grades) {
  const percentage = (marks / maxMarks) * 100;
  for (let i = 0; i < grades.length; i++) {
    if (percentage >= grades[i].markFrom && percentage <= grades[i].markTo)
      return grades[i];
  }
  return "";
}

function getDateParts(givenDate) {
  let date = new Date(givenDate);
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error("Invalid date");
  }

  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based, so we add 1
  const year = date.getFullYear();

  return { day, month, year };
}

function stripTimeFromDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getFirstAndLastDateOfMonth(year, month) {
  // JavaScript months are zero-based, so January is 0 and December is 11.
  const firstDate = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0); // Setting day as 0 gets the last date of the previous month

  return {
    fromDate: firstDate.toISOString().split("T")[0], // format as YYYY-MM-DD
    toDate: lastDate.toISOString().split("T")[0], // format as YYYY-MM-DD
  };
}

module.exports = {
  multerConfig,
  compileTemplate,
  hashing,
  hashVerfiy,
  getMonthStartAndEndDate,
  getGrade,
  marksCompresser,
  marksCompressRateGiver,

  // aws
  uploadFileToS3,
  deleteFile,
  getFileSizeFromS3Url,
  convertBytesToHumanReadableSize,

  // required fields in schema validator
  createRequiredFieldsMiddleware,

  getDateRange,
  getMonthStartAndEndMonth,
  getDateWithTime,
  randomID,

  // error
  notFoundError,

  // exams
  getGrade,
  getDateParts,
  stripTimeFromDate,
  getFirstAndLastDateOfMonth,
};
