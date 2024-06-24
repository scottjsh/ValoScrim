const { EmbedBuilder } = require("discord.js");
const configs = require("../../configs.json");

async function version(client, msg) {
  const embed = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("버전")
    .setDescription(`현재 봇의 버전은 \`${configs.version}\`입니다.`);

  msg.reply({
    embeds: [embed],
  });
}

module.exports = version;
