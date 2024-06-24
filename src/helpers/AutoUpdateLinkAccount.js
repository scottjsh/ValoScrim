const PlayerModel = require("../models/Player");
const LinkAccount = require("./LinkAccount");

async function AutoUpdateLinkAccount(client) {
  console.log("업데이트가 필요한 계정을 확인합니다.");

  let player;

  const pwd = await PlayerModel.findOne({
    link_id: { $ne: null },
    link_date: null,
  });

  if (pwd) {
    player = pwd;
  } else {
    const t = new Date();
    t.setHours(t.getHours() - 24);

    player = await PlayerModel.findOne({
      link_id: { $ne: null },
      link_date: {
        $lt: t,
      },
    });
  }

  if (!player) {
    console.log("업데이트가 필요한 계정이 없습니다.");
    return;
  }

  const puuid = player.link_id;
  const user = player.user_id;
  // const guild = await client.guilds.fetch("1170641124084432896");

  LinkAccount({ puuid, user })
    .then((res) => {
      const { account } = res;
      console.log(`계정 ${account.name}#${account.tag} 업데이트 완료`);
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = AutoUpdateLinkAccount;
