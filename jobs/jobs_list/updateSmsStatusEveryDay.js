const moment = require("moment");
const { SmsV2 } = require("../../models/newCommunication/smsv2");
const { getDeliveryStatus } = require("../../utils/sms");

const autoUpdateSmsbackup = async () => {
  try {
    let allSms = await SmsV2.find();
    if (allSms.length) {
      for (let smsSent of allSms) {
        let expired = moment(Date.now()).diff(smsSent.updatedAt, "days") > 2;
        if (smsSent.messageDetails.length && !expired) {
          for (let sms of smsSent.messageDetails) {
            let report = await getDeliveryStatus(sms.messageid);
            console.log(report.data, "report");
            if (report.status === 200 && report.data[0].deliverystatus) {
              // console.log(report.data, "report");
              let deliveryStatus = report.data[0].deliverystatus;
              await SmsV2.findOneAndUpdate(
                { _id: id, "messageDetails.messageid": sms.messageid },
                {
                  $set: {
                    "messageDetails.$.deliveryStatus": deliveryStatus
                      ? deliveryStatus
                      : "NA",
                    updatedAt: Date.now(),
                  },
                  $inc: {
                    totalBlocked: deliveryStatus === "BLOCKED" ? 1 : 0,
                    totalRejected: deliveryStatus === "REJECTD" ? 1 : 0,
                    totalDelivered: deliveryStatus === "DELIVRD" ? 1 : 0,
                    totalWaiting: deliveryStatus ? -1 : 0,
                  },
                }
              );
            } else {
              console.log(report.status, report.statusText);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const updateSmsStatusEveryDay = (agenda) => {
  agenda.define("updateSmsStatusEveryDay", async (job) => {
    autoUpdateSmsbackup();
  });
};

module.exports = updateSmsStatusEveryDay;
