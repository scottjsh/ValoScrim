const { EmbedBuilder, userMention } = require("discord.js");

const PlayerModel = require("../models/Player");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../helpers/DeleteMessage");
const MemberElo = require("../helpers/MemberElo");

async function players(client, msg, args) {
  let [page, ...configs] = args;

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("플레이어 목록 조회 중")
    .setDescription("`잠시 기다려 주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  const order = configs.includes("--asc") ? "asc" : "desc";
  const limit = 10;

  if (!page) page = 1;

  if (isNaN(page)) {
    DeleteMessage(m);
    return;
  }

  const skip = limit * (page - 1);

  const players = await PlayerModel.find()
    .limit(limit)
    .skip(skip)
    .sort({ win_rate: order });

  const members = await msg.guild.members.fetch();

  if (players.length == 0) {
    const embed3 = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("플레이어 목록")
      .setDescription("목록이 비어 있습니다.");

    await m.edit({
      embeds: [embed3],
    });
    return;
  }

  const list = [];
  for (let prop in players) {
    const player = players[prop];

    const elo = await MemberElo({
      guild: msg.guild,
      user: player.user_id,
      members,
    });

    list.push(
      `${userMention(player.user_id)} | ${
        configs.includes("--id")
          ? `\`${player.user_id}\``
          : `승리: ${player.matches_won}/${player.matches} • 승률: ${(
              player.win_rate * 100
            ).toFixed(0)}%`
      } ${elo.string}`
    );
  }

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("플레이어 목록")
    .setDescription(
      `멤버 ${msg.author}님이 플레이어 목록을 조회했습니다 ${EmbedWhiteSpace()}`
    )
    .addFields({
      name: "목록:",
      value: list.join("\n") + EmbedWhiteSpace(),
    })
    .setFooter({
      text: `페이지: ${page}\u1CBC • \u1CBC페이지당 플레이어 수: ${limit}`,
    });

  await m.edit({
    embeds: [embed2],
  });
}

module.exports = players;
