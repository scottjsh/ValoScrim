const { EmbedBuilder, userMention } = require("discord.js");

const BlockedPlayerModel = require("../models/BlockedPlayer");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../helpers/DeleteMessage");

async function blockeds(client, msg, args) {
  let [page, configs] = args;

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("차단된 플레이어 목록 불러오는 중")
    .setDescription("`잠시만 기다려 주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  const limit = 10;
  if (!page) page = 1;

  if (isNaN(page)) {
    DeleteMessage(m);
    return;
  }

  const skip = limit * (page - 1);

  const blockeds = await BlockedPlayerModel.find({
    user_id: msg.author.id,
  })
    .limit(limit)
    .skip(skip);

  const list = [];
  blockeds.forEach((player) => {
    list.push(`${userMention(player.blocked_id)} | \`${player.blocked_id}\``);
  });

  if (blockeds.length == 0) {
    const embed2 = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("차단된 플레이어 목록")
      .setDescription(
        `회원 ${msg.author}는 차단된 플레이어가 없습니다. ${EmbedWhiteSpace()}`
      );

    await m.edit({
      embeds: [embed2],
    });
    return;
  }

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("차단된 플레이어 목록")
    .setDescription(
      `회원 ${msg.author}가 차단한 플레이어들 ${EmbedWhiteSpace()}`
    )
    .addFields({
      name: "목록:",
      value: list.join("\n") + EmbedWhiteSpace(),
    })
    .setFooter({
      text: `페이지: ${page}\u1CBC • \u1CBC페이지 당 플레이어 수: ${limit}`,
    });

  await m.edit({
    embeds: [embed2],
  });
}

module.exports = blockeds;
