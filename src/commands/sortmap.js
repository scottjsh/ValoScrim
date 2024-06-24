const { EmbedBuilder } = require("discord.js");

const SortMap = require("../helpers/SortMap");
const DeleteMessage = require("../helpers/DeleteMessage");

async function sortmap(client, msg, args) {
  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("맵 추첨 중")
    .setDescription("`잠시 기다려주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  try {
    const map = await SortMap();

    const embed2 = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("추첨된 맵")
      .setDescription(
        `멤버 ${msg.author}님이 **${map.displayName}** 맵을 추첨했습니다.`
      )
      .setThumbnail(map.displayIcon)
      .setImage(map.splash);

    await m.edit({
      embeds: [embed2],
    });
  } catch (err) {
    DeleteMessage(m);
  }
}

module.exports = sortmap;
