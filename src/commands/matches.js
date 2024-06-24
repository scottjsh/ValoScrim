const { EmbedBuilder, userMention } = require("discord.js");

const PlayerModel = require("../models/Player");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");

async function matches(client, msg, args) {
  const [user] = args;

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("경기 검색 중")
    .setDescription("`잠시만 기다려 주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  const user_id = user ? user.slice(0, -1).slice(2) : msg.author.id;

  const player = await PlayerModel.findOne({
    user_id,
  });

  const wrString = player
    ? `${(player.win_rate * 100).toFixed(2)}%`
    : "정의되지 않음";

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("경기 목록")
    .setDescription(
      `회원 ${msg.author}님이 ${
        user ? `${userMention(user_id)} ${EmbedWhiteSpace()}` : "자신의"
      } 경기를 검색했습니다`
    )
    .addFields([
      {
        name: "경기 수",
        value: player ? `${player.matches}` : "정의되지 않음",
        inline: true,
      },
      {
        name: "승리 수",
        value: player ? `${player.matches_won}` : "정의되지 않음",
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

module.exports = matches;
