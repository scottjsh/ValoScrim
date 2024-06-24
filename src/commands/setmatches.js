const { EmbedBuilder, userMention } = require("discord.js");

const PlayerModel = require("../models/Player");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../helpers/DeleteMessage");

async function setmatches(client, msg, args) {
  const [user, matches_won, matches] = args;

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("판 수 저장 중")
    .setDescription("`잠시만 기다려주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  if (!msg.member.permissions.has("ADMINISTRATOR")) {
    DeleteMessage(m);
    return;
  }

  if (
    !user ||
    !user.includes("<@") ||
    !user.includes(">") ||
    !matches ||
    isNaN(matches) ||
    !matches_won ||
    isNaN(matches_won) ||
    Number(matches_won) > Number(matches)
  ) {
    DeleteMessage(m);
    return;
  }

  const user_id = user.slice(0, -1).slice(2);
  let win_rate = 0;
  if (matches != 0) {
    win_rate = (matches_won / matches).toFixed(2);
  }

  await PlayerModel.findOneAndUpdate(
    {
      user_id,
    },
    {
      user_id,
      matches,
      matches_won,
      win_rate,
    },
    {
      upsert: true,
    }
  );

  const wrString = `${(win_rate * 100).toFixed(0)}%`;

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("판 수 저장 완료")
    .setDescription(
      `멤버 ${msg.author}님이 플레이어 ${userMention(
        user_id
      )}의 판 수를 설정했습니다. ${EmbedWhiteSpace()}`
    )
    .addFields([
      {
        name: "판 수",
        value: matches,
        inline: true,
      },
      {
        name: "승리 수",
        value: matches_won,
        inline: true,
      },
      {
        name: "승률",
        value: wrString,
        inline: true,
      },
    ]);

  m.edit({
    embeds: [embed2],
  });
}

module.exports = setmatches;
