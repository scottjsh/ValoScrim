const { EmbedBuilder, userMention } = require("discord.js");

const MatchModel = require("../../models/Match");
const PlayerMatchModel = require("../../models/PlayerMatch");

const EmbedWhiteSpace = require("../../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../../helpers/DeleteMessage");
const RemoveReaction = require("../../helpers/RemoveReaction");

async function listPlayers(client, reaction, user, add) {
  if (!add) return;

  const channel = client.channels.cache.get(reaction.message.channelId);

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("플레이어 목록 확인 중")
    .setDescription("`잠시만 기다려 주세요...`");

  const m = await channel.send({
    embeds: [embed1],
  });

  RemoveReaction(reaction, user);

  const match = await MatchModel.findOne({
    message_id: reaction.message.id,
  });

  if (!match) {
    DeleteMessage(m);
    return;
  }

  const players = await PlayerMatchModel.find({
    match_id: match._id,
  });

  let mentions = [];
  if (players.length > 0) {
    players.forEach((player) => {
      mentions.push(userMention(player.user_id));
    });
  }

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("플레이어 목록")
    .setDescription(
      `회원 ${userMention(
        user.id
      )}님이 확인한 플레이어 목록입니다 ${EmbedWhiteSpace()}`
    )
    .addFields({
      name: `\`${players.length}\` ${
        players.length !== 1 ? "명의 확인된 플레이어" : "명의 확인된 플레이어"
      }`,
      value: players.length > 0 ? mentions.join("\n") : "확인된 플레이어 없음",
    });

  await m.edit({
    embeds: [embed2],
  });
}

module.exports = listPlayers;
