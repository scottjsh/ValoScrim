const { EmbedBuilder, userMention } = require("discord.js");

const BlockedPlayerModel = require("../models/BlockedPlayer");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../helpers/DeleteMessage");

async function unblock(client, msg, args) {
  const [user_id] = args;

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("플레이어를 차단 해제 중")
    .setDescription("`잠시만 기다려 주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  if (!user_id || isNaN(user_id)) {
    DeleteMessage(m);
    return;
  }

  const blocked = await BlockedPlayerModel.findOne({
    user_id: msg.author.id,
    blocked_id: user_id,
  });

  if (!blocked) {
    const embed2 = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("플레이어 차단 해제 실패")
      .setDescription(`차단 해제가 다음 이유 중 하나로 실패했습니다:`)
      .addFields([
        {
          name: "플레이어가 차단되지 않음",
          value: `지정된 플레이어는 차단 목록에 없습니다.`,
        },
        {
          name: "플레이어를 찾을 수 없음",
          value: "지정된 플레이어를 찾을 수 없거나 더 이상 회원이 아닙니다.",
        },
      ]);

    await m.edit({
      embeds: [embed2],
    });
    return;
  }

  await BlockedPlayerModel.deleteOne({
    _id: blocked.id,
  });

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("플레이어 차단 해제됨")
    .setDescription(
      `회원 ${msg.author}가 회원 ${userMention(
        user_id
      )}의 차단을 해제했습니다 ${EmbedWhiteSpace()}`
    );

  await m.edit({
    embeds: [embed2],
  });
}

module.exports = unblock;
