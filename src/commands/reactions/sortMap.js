const { EmbedBuilder, userMention } = require("discord.js");

const MatchModel = require("../../models/Match");
const MapSortMatchModel = require("../../models/MapSortMatch");

const SortMap = require("../../helpers/SortMap");
const DeleteMessage = require("../../helpers/DeleteMessage");
const RemoveReaction = require("../../helpers/RemoveReaction");

async function sortMap(client, reaction, user, add) {
  if (!add) return;

  const channel = client.channels.cache.get(reaction.message.channelId);

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("맵 추첨 중")
    .setDescription("`잠시만 기다려 주세요...`");

  const m = await channel.send({
    embeds: [embed1],
  });

  RemoveReaction(reaction, user);

  const match = await MatchModel.findOne({
    message_id: reaction.message.id,
  });

  if (!match || match.creator_id !== user.id) {
    DeleteMessage(m);
    return;
  }

  const sorts = await MapSortMatchModel.find({
    match_id: match._id,
  });

  sorts.forEach(async (sort) => {
    await DeleteMessage(sort.message_id, channel);
  });

  await MapSortMatchModel.deleteMany({
    match_id: match._id,
  });

  try {
    const map = await SortMap();

    const embed2 = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("맵 추첨 완료")
      .setDescription(
        `${userMention(user.id)} 님이 **${
          map.displayName
        }** 맵을 추첨하셨습니다`
      )
      .setThumbnail(map.displayIcon)
      .setImage(map.splash);

    await m.edit({
      embeds: [embed2],
    });

    await MapSortMatchModel.create({
      match_id: match._id,
      message_id: m.id,
      name: map.displayName,
    });
  } catch (err) {
    DeleteMessage(m);
  }
}

module.exports = sortMap;
