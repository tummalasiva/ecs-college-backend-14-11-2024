const axios = require("axios").default;

const baseUrl = process.env.SERVICE_URL;

// get messageid from the response
const sendSms = (
  message,
  contacts = [],
  templateId = process.env.TEMPLATE_ID
) => {
  return axios.post(
    baseUrl,
    {},
    {
      params: {
        user: process.env.SMS_USER,
        password: process.env.SMS_PASSWORD,
        senderid: process.env.SENDER_ID,
        tempid: templateId,
        entityid: process.env.ENTITY_ID,
        mobiles: contacts.join(","),
        sms: message,
        accusage: 1,
        responsein: "JSON",
      },
    }
  );
};

const getSmsBalance = () => {
  return axios.get("http://sms.ecampusstreet.com/getbalance.jsp", {
    params: {
      user: process.env.USER,
      password: process.env.PASSWORD,
      accusage: 1,
      responsein: "JSON",
    },
  });
};

const getDeliveryStatus = async (messageId) => {
  return axios.get("http://sms.ecampusstreet.com/getDLR.jsp", {
    params: {
      userid: process.env.USER,
      password: process.env.PASSWORD,
      accusage: 1,
      responsein: "JSON",
      messageid: messageId,
    },
  });
};

module.exports = {
  sendSms,
  getSmsBalance,
  getDeliveryStatus,
};
