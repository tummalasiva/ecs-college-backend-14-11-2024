/**
 * name : middlewares/authenticator
 * author : Aman Kumar Gupta
 * Date : 21-Oct-2021
 * Description : Validating authorized requests
 */

const jwt = require("jsonwebtoken");

const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const UsersData = require("@db/users/queries");
const emloyeeQueries = require("@db/employee/queries");
const studentQueries = require("@db/student/queries");

function getSecondTwoWordsAfterV1(url) {
  const parts = url.split("/");
  const indexV1 = parts.indexOf("v1");

  if (indexV1 !== -1 && indexV1 < parts.length - 2) {
    return [parts[indexV1 + 1], parts[indexV1 + 2]];
  } else {
    return null; // v1 not found or not enough parts after v1
  }
}

const METHOD_MAP = {
  get: "view",
  post: "add",
  put: "update",
  delete: "delete",
  patch: "update",
};

const CONTROLLER_MAP = {
  role: "roles and permission",
  brand: "brand",
  bundle: "bundle",
  bundleType: "bundle type",
  conditionCode: "condition code",
  courierMode: "courier mode",
  courierPartner: "courier partner",
  currentActivityCode: "activity code",
  damageCode: "damage code",
  employee: "employee",
  family: "family",
  form: "custom fields",
  gradeScale: "grading scale",
  inboundEntry: "inbound process",
  item: "inventory",
  itemCategory: "item category",
  outbound: "outbound",
  ownerCode: "owner code",
  ownerGroup: "owner group",
  packaging: "packaging",
  palletCode: "pallet code",
  pickList: "pick-list",
  stockType: "stock type",
  storageCode: "storage code",
  subFamily: "sub-family",
  updateStatus: "update status",
  warehouse: "warehouse",
  workFlowCode: "workflow code",
  itemHistory: "item history",
};

module.exports = async function (req, res, next) {
  try {
    let internalAccess = false;
    let guestUrl = false;
    const authHeader = req.get("X-auth-token");

    await Promise.all(
      common.internalAccessUrls.map(async function (path) {
        if (req.path.includes(path)) {
          if (
            req.headers.internal_access_token &&
            process.env.INTERNAL_ACCESS_TOKEN ==
              req.headers.internal_access_token
          ) {
            internalAccess = true;
          }
        }
      })
    );
    common.guestUrls.map(function (path) {
      if (req.path.includes(path)) {
        guestUrl = true;
      }
    });

    if (internalAccess || guestUrl) {
      next();
      return;
    }
    if (!authHeader) {
      const authHeader = req.get("X-auth-token");
      if (!authHeader) {
        throw common.failureResponse({
          message: "UNAUTHORIZED_REQUEST",
          statusCode: httpStatusCode.unauthorized,
          responseCode: "UNAUTHORIZED",
        });
      }
    }

    const authHeaderArray = authHeader.split(" ");
    if (authHeaderArray[0] !== "bearer") {
      throw common.failureResponse({
        message: "UNAUTHORIZED_REQUEST",
        statusCode: httpStatusCode.unauthorized,
        responseCode: "UNAUTHORIZED",
      });
    }

    let decodedToken = "";

    try {
      decodedToken = jwt.verify(
        authHeaderArray[1],
        process.env.JWT_PRIVATE_KEY
      );
    } catch (err) {
      err.statusCode = httpStatusCode.unauthorized;
      err.responseCode = "UNAUTHORIZED";
      err.message = "ACCESS_TOKEN_EXPIRED";
      throw err;
    }

    if (!decodedToken) {
      throw common.failureResponse({
        message: "UNAUTHORIZED_REQUEST",
        statusCode: httpStatusCode.unauthorized,
        responseCode: "UNAUTHORIZED",
      });
    }

    if (decodedToken.userType === "employee") {
      let employee = await emloyeeQueries.findOne({ _id: decodedToken._id });
      if (!employee)
        throw common.failureResponse({
          message: "Account does not exist!",
          statusCode: httpStatusCode.unauthorized,
          responseCode: "UNAUTHORIZED",
        });

      if (employee.role.name !== "SUPER ADMIN") {
        req.schoolId = decodedToken.schoolId;

        const controller = getSecondTwoWordsAfterV1(req.originalUrl)[0];
        if (controller !== "account") {
          let rolePermissions = employee.role?.permissions;
          let requiredPermissionModuleName = CONTROLLER_MAP[controller];

          let modulePresent = rolePermissions.filter(
            (r) => r.module.toLowerCase() === requiredPermissionModuleName
          )[0];

          if (
            !modulePresent?.module ||
            !modulePresent.permissions.includes(
              METHOD_MAP[req.method.toLowerCase()]
            )
          ) {
            throw common.failureResponse({
              message: "PERMISSION_DENIED",
              statusCode: httpStatusCode.bad_request,
              responseCode: "CLIENT_ERROR",
            });
          }
        }
      }

      if (["post", "put"].includes(req.method.toLowerCase())) {
        req.schoolId = req.body.schoolId;
        delete req.body.schoolId;
      } else {
        req.schoolId = req.query.schoolId;
      }

      req.employee = employee;

      next();
    } else if (decodedToken.userType === "student") {
      let studentExists = await studentQueries.findOne({
        _id: decodedToken._id,
      });
      if (!studentExists) {
        return common.failureResponse({
          message: "Account does not exist!",
          statusCode: httpStatusCode.unauthorized,
          responseCode: "UNAUTHORIZED",
        });
      }

      if (["post", "put"].includes(req.method.toLowerCase())) {
        req.schoolId = req.body.schoolId;
        delete req.body.schoolId;
      } else {
        req.schoolId = req.query.schoolId;
      }

      req.student = studentExists;

      next();
    } else {
      return common.failureResponse({
        message: "UNAUTHORIZED_REQUEST",
        statusCode: httpStatusCode.unauthorized,
        responseCode: "UNAUTHORIZED",
      });
    }
  } catch (err) {
    next(err);
  }
};
