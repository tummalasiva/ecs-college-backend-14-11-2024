// const form = require('@generics/form')
const { elevateLog, correlationId } = require("elevate-logger");
const logger = elevateLog.init();
const successResponse = async ({
  statusCode = 200,
  responseCode = "OK",
  message,
  result = [],
  meta = {},
}) => {
  // const versions = await form.getAllFormsVersion()
  let response = {
    statusCode,
    responseCode,
    message,
    result,
    meta: meta,
  };
  logger.info("Request Response", { response: response });

  return response;
};

const failureResponse = ({
  message = "Oops! Something Went Wrong.",
  statusCode = 500,
  responseCode,
}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.responseCode = responseCode;
  return error;
};

module.exports = {
  pagination: {
    DEFAULT_PAGE_NO: 1,
    DEFAULT_PAGE_SIZE: 100,
  },
  successResponse,
  failureResponse,
  guestUrls: [
    "ecamps/v1/account/login",
    "ecamps/v1/account/create",
    "ecamps/v1/account/generateOtp",
    "ecamps/v1/account/resetPassword",
    "ecamps/v1/account/refreshToken",
    "ecamps/v1/school/listPublic",
    "ecamps/v1/guardianFeedback/create",
    "ecamps/v1/guardianFeedback/listPublic",
    "ecamps/v1/news/listPublic",
    "ecamps/v1/event/listPublic",
    "ecamps/v1/notice/listPublic",
    "ecamps/v1/gallery/listPublic",
    "ecamps/v1/awards/listPublic",
    "ecamps/v1/splashNews/listPublic",
    "ecamps/v1/sms/updateSmsStatus",
  ],
  internalAccessUrls: [
    "bulkCreateMentors",
    "ecamps/v1/account/verifyMentor",
    "profile/details",
    "ecamps/v1/account/list",
    "/profile/share",
    "/organisations/details",
  ],
  notificationEmailType: "email",
  accessTokenExpiry: `${process.env.ACCESS_TOKEN_EXPIRY}d`,
  refreshTokenExpiry: `${process.env.REFRESH_TOKEN_EXPIRY}d`,
  refreshTokenExpiryInMs:
    Number(process.env.REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000,
  otpExpirationTime: process.env.OTP_EXP_TIME, // In Seconds
  SIGN_UP_OTP:
    "Dear {name}, Your One Time Password(OTP) {otp} is for registration . This OTP will be valid for the next 15 mins. - webspruce",
  FORGOT_OTP:
    "Dear {name}, {otp} is OTP for your reset password and valid for next 15minutes, please do not share with anyone -webspruce",
  ORDER_COMPLETE_MESSAGE:
    "Dear {name}, Your order {orderId} is ready kindly pickup the order from {address} - webspruce",
  ORDER_REJECT_MESSAGE:
    "Dear {name}, Your order {orderId} got rejected, if any amount was deducted it will get refunded within 7 working days - webspruce",
  ORDER_ACCEPT_MESSAGE:
    "Dear {name}, Store manager accepted your order and your order ID is {orderId} - webspruce",
};
