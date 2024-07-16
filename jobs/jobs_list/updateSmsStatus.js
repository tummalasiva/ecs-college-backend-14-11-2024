const smsQuery = require("@db/sms/queries");
const { getDeliveryStatus } = require("../../sms-service/smsService");

const autoUpdateSmsbackup = async (smsId) => {
  try {
    const smsSent = await smsQuery.findOne({ _id: smsId });

    if (smsSent && smsSent.messageDetails.length) {
      for (let sms of smsSent.messageDetails) {
        try {
          const report = await getDeliveryStatus(sms.messageid);
          console.log(report.data, "report");

          if (report.status === 200 && report.data[0].deliverystatus) {
            const deliveryStatus = report.data[0].deliverystatus;

            await smsQuery.updateOne(
              { _id: smsId, "messageDetails.messageid": sms.messageid },
              {
                $set: {
                  "messageDetails.$.deliveryStatus": deliveryStatus || "NA",
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
            console.log(
              `Failed to get delivery status: ${report.status} ${report.statusText}`
            );
          }
        } catch (smsError) {
          console.log(
            `Error fetching delivery status for message ID ${sms.messageid}:`,
            smsError
          );
        }
      }
    } else {
      console.log(`No SMS found with ID: ${smsId}`);
    }
  } catch (error) {
    console.error(`Error updating SMS with ID ${smsId}:`, error);
  }
};

const updateSmsStatus = (agenda) => {
  agenda.define("updateSmsStatus", async (job) => {
    try {
      const { id } = job.attrs.data;
      console.log(`Updating SMS status for ID: ${id}`);
      await autoUpdateSmsbackup(id);
    } catch (jobError) {
      console.error(`Error in updateSmsStatus job:`, jobError);
    }
  });
};

module.exports = updateSmsStatus;
