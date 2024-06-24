const { EmbedBuilder, userMention } = require("discord.js");

const PlayerModel = require("../models/Player");
const BlockedPlayerModel = require("../models/BlockedPlayer");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../helpers/DeleteMessage");

async function block(client, msg, args) {
  const [user_id] = args;

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("플레이어 차단 중")
    .setDescription("`잠시만 기다려 주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  if (!user_id || isNaN(user_id)) {
    DeleteMessage(m);
    return;
  }

  const limit = 3;
  const player = await PlayerModel.findOne({
    user_id,
  });

  const blockeds = await BlockedPlayerModel.find({
    user_id: msg.author.id,
  });

  let blocked = false;
  blockeds.forEach((player) => {
    if (player.blocked_id === user_id) blocked = true;
  });

  if (
    blocked ||
    blockeds.length >= limit ||
    !player ||
    user_id === msg.author.id
  ) {
    const embed2 = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("플레이어 차단 실패")
      .setDescription(`차단 시도가 다음 이유 중 하나로 실패했습니다:`)
      .addFields([
        {
          name: "제한 도달",
          value: `최대 ${limit}명의 플레이어만 차단할 수 있습니다.`,
        },
        {
          name: "플레이어를 찾을 수 없음",
          value: "지정된 플레이어를 찾을 수 없거나 더 이상 회원이 아닙니다.",
        },
        {
          name: "이미 차단된 플레이어",
          value: "지정된 플레이어는 이미 차단 목록에 있습니다.",
        },
        {
          name: "자신은 차단할 수 없음",
          value: "지정된 플레이어의 ID가 본인의 ID와 같습니다.",
        },
      ]);

    await m.edit({
      embeds: [embed2],
    });

    return;
  }

  await BlockedPlayerModel.create({
    user_id: msg.author.id,
    blocked_id: user_id,
  });

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("플레이어 차단됨")
    .setDescription(
      `회원 ${msg.author}가 회원 ${userMention(
        user_id
      )}을 차단했습니다 ${EmbedWhiteSpace()}`
    )
    .setFooter({
      text: `⚠️ 차단은 차단된 플레이어들 사이의 게임 발생 확률을 크게 줄이지만, 필요할 경우 발생할 수 있습니다.`,
    });

  await m.edit({
    embeds: [embed2],
  });
}

module.exports = block;
