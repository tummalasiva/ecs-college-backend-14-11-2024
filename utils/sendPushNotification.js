const admin = require("firebase-admin");

const sendPushNotification = async (
  token,
  message = {
    title: "Excellent",
    body: "",
    imageUrl: "https://excellentschool.in/Logo.png",
  },
  type
) => {
  const { title, body, imageUrl } = message;
  return await admin.messaging().send({
    token,
    data: {
      type: type,
    },
    android: {
      priority: 1,
    },
    notification: {
      title,
      body,
      imageUrl: imageUrl || "https://excellentschool.in/Logo.png",
    },
  });
};

const sendPushNotificationToMany = async (
  tokens,
  message = {
    title: "Excellent",
    body: "",
    imageUrl: "https://excellentschool.in/Logo.png",
  },
  type
) => {
  const { title, body, imageUrl } = message;
  return await admin.messaging().sendEachForMulticast({
    tokens,
    android: {
      priority: 1,
    },
    data: {
      type,
    },
    notification: {
      title,
      body,
      imageUrl: imageUrl || "https://excellentschool.in/Logo.png",
    },
  });
};

module.exports.sendPushNotification = sendPushNotification;
module.exports.sendPushNotificationToMany = sendPushNotificationToMany;
