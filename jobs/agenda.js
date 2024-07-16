let agenda = require("../lib/agenda");

let jobTypes = ["updateSmsStatus", "updateSmsStatusEveryDay"];

jobTypes.forEach((type) => {
  require("./jobs_list/" + type)(agenda);
});

if (jobTypes.length) {
  agenda.on("ready", async () => {
    console.log("Job started");
    await agenda.start();
    await agenda.every("1 0 * * *", "updateSmsStatusEveryDay");
  });
}

let graceful = () => {
  agenda.stop(() => process.exit(0));
};

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);

module.exports = agenda;
