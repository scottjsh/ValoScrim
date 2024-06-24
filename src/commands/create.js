const { EmbedBuilder } = require("discord.js");

const MatchModel = require("../models/Match");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../helpers/DeleteMessage");

async function create(client, msg, args) {
  let [player_limit] = args;

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("내전 설정 중")
    .setDescription("`잠시만 기다려 주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  await MatchModel.create({
    message_id: m.id,
    creator_id: msg.author.id,
    user_id: msg.author.id,
    player_limit: player_limit || 5,
  });

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("내전 생성됨")
    .setDescription(
      `회원 ${msg.author}가 **내전**을 주최하고 싶어합니다 ${EmbedWhiteSpace()}`
    )
    .addFields(
      {
        name: "유형",
        value:
          (player_limit ? `${player_limit} vs ${player_limit}` : "5 vs 5") +
          EmbedWhiteSpace(),
        inline: true,
      },
      {
        name: "참여 방법",
        value: "이 메시지에 ✅로 반응하세요",
      },
      {
        name: "플레이어 목록 보기",
        value: "이 메시지에 📃로 반응하세요",
      },
      {
        name: "맵을 추첨(",
        value: "이 메시지에 🗺️로 반응하세요",
      },
      {
        name: "팀 정렬",
        value: `이 메시지에 🎲로 반응하세요 ${EmbedWhiteSpace()}`,
      }
    )
    .setFooter({
      text: `**⚠️ 내전 생성자**만 맵이나 플레이어를 추첨할 수 있습니다`,
    });

  await m.edit({
    embeds: [embed2],
  });

  await m.react("✅");
  await m.react("📃");
  await m.react("🗺️");
  await m.react("🎲");
}

module.exports = create;
