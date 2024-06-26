const { EmbedBuilder, userMention } = require("discord.js");

const MatchModel = require("../../models/Match");
const PlayerSortMatchModel = require("../../models/PlayerSortMatch");
const VoteResultMatchModel = require("../../models/VoteResultMatch");
const SortMatchModel = require("../../models/SortMatch");
const MapSortMatchModel = require("../../models/MapSortMatch");
const PlayerModel = require("../../models/Player");
const ChannelMatchModel = require("../../models/ChannelMatch");

const EmbedWhiteSpace = require("../../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../../helpers/DeleteMessage");
// const ResultImage = require("../../helpers/ResultImage");

const VAPI = require("../../helpers/ValorantAPI");

async function resultMatch(attacker, client, reaction, user, add) {
  const channel = client.channels.cache.get(reaction.message.channelId);

  let m;
  if (add) {
    const embed1 = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("결과 등록 중")
      .setDescription("`잠시만 기다려 주세요...`");

    m = await channel.send({
      embeds: [embed1],
    });
  }

  const match = await MatchModel.findOne({
    result_id: reaction.message.id,
  });

  if (!match) {
    if (m) DeleteMessage(m);
    return;
  }

  const sort = await SortMatchModel.findOne({
    match_id: match._id,
  });

  const captains = await PlayerSortMatchModel.find({
    sort_id: sort._id,
    captain: true,
  });

  let verify = false;
  captains.forEach((captain) => {
    if (captain.user_id === user.id) verify = true;
  });

  if (!verify) {
    if (m) DeleteMessage(m);
    return;
  }

  await VoteResultMatchModel.deleteMany({
    user_id: user.id,
    match_id: match._id,
  });

  if (!add) {
    if (m) DeleteMessage(m);
    return;
  }

  await VoteResultMatchModel.create({
    user_id: user.id,
    match_id: match._id,
    attacker,
  });

  const votes = await VoteResultMatchModel.find({
    match_id: match._id,
  });

  if (votes.length < 2) {
    if (m) DeleteMessage(m);
    return;
  }

  verify = true;

  let winner;
  votes.forEach((vote) => {
    const win = vote.attacker ? "attacker" : "defender";

    if (!winner) winner = win;
    else if (win !== winner) verify = false;
  });

  if (!verify) {
    if (m) DeleteMessage(m);
    return;
  }

  const result = {
    winners: [],
    losers: [],
  };

  result.winners = await PlayerSortMatchModel.find({
    sort_id: sort._id,
    attacker: winner === "attacker",
  });

  result.losers = await PlayerSortMatchModel.find({
    sort_id: sort._id,
    attacker: winner === "defender",
  });

  for (let type in result) {
    const users = result[type];

    users.forEach(async (user) => {
      const player = await PlayerModel.findOne({
        user_id: user.user_id,
      });

      const matches = (player ? player.matches : 0) + 1;
      const matches_won =
        (player ? player.matches_won : 0) + (type === "winners" ? 1 : 0);
      const win_rate = (matches_won / matches).toFixed(2);

      await PlayerModel.findOneAndUpdate(
        {
          user_id: user.user_id,
        },
        {
          user_id: user.user_id,
          matches,
          matches_won,
          win_rate,
        },
        {
          upsert: true,
        }
      );
    });
  }

  let mentions = [];
  captains.forEach((captain) => {
    mentions.push(userMention(captain.user_id));
  });

  const find_channel = await ChannelMatchModel.find({
    match_id: match._id,
  });
  const find_category = await MatchModel.findOne({
    _id: match._id,
  });
  for (let channel of find_channel) {
    reaction.message.guild.channels.cache.get(channel.channel_id).delete();
  }
  reaction.message.guild.channels.cache.get(find_category.category_id).delete();
  reaction.message.guild.roles.cache.get(find_category.role_id).delete();

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("결과 등록됨")
    .setDescription(
      `주장 ${mentions.join(" 및 ")}이(가) ${
        winner === "attacker" ? "**A팀**" : "**B팀**"
      }를 승자로 결정했습니다 ${EmbedWhiteSpace()}`
    )
    .setFooter({
      text: `매치 ID: ${match._id}`,
    });

  await m.edit({
    embeds: [embed2],
  });

  DeleteMessage(reaction.message);

  for (let captain of captains) {
    const player = await PlayerModel.findOne({
      user_id: captain.user_id,
    });

    if (player.link_id) {
      const obj = await VAPI.getMatches({
        puuid: player.link_id,
        region: player.link_region ? player.link_region : "kr",
        filters: {
          type: "custom",
          size: 1,
        },
      });

      if (obj.errors) return;

      const matches = obj.data;

      if (!matches) return;

      const map = await MapSortMatchModel.findOne({
        match_id: match._id,
      });

      // if (matches[0].metadata.map.toLowerCase() === map.name.toLowerCase()) {
      //   const image = await ResultImage(matches[0]);

      //   if (image) {
      //     const attachment = new AttachmentBuilder(image, {
      //       name: `match-result-${match._id}.png`,
      //     });

      //     const channel = await client.channels.cache.get(
      //       "1087450850114424873"
      //     );

      //     await channel.send({
      //       files: [attachment],
      //     });

      //     break;
      //   }
      // }
    }
  }
}

module.exports = resultMatch;
