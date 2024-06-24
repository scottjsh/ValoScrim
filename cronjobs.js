const cron = require("node-cron");

const AutoUpdateLinkAccount = require("./src/helpers/AutoUpdateLinkAccount");

async function cronjobs(client) {
  // 매일 00:00에 실행
  cron.schedule("0 0 * * *", () => {
    AutoUpdateLinkAccount(client);
  });
}

module.exports = cronjobs;
