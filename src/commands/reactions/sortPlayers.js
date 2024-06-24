const { EmbedBuilder, userMention } = require("discord.js");

const MatchModel = require("../../models/Match");
const PlayerMatchModel = require("../../models/PlayerMatch");
const PlayerSortMatchModel = require("../../models/PlayerSortMatch");
const SortMatchModel = require("../../models/SortMatch");
const PlayerModel = require("../../models/Player");
const BlockedPlayerModel = require("../../models/BlockedPlayer");

const EmbedWhiteSpace = require("../../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../../helpers/DeleteMessage");
const RemoveReaction = require("../../helpers/RemoveReaction");
const MemberElo = require("../../helpers/MemberElo");

async function sortPlayers(client, reaction, user, add) {
  if (!add) return;

  const channel = client.channels.cache.get(reaction.message.channelId);

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("플레이어 정렬 중")
    .setDescription("`잠시 기다려주세요...`");

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

  let players = await PlayerMatchModel.find({
    match_id: match._id,
  });

  if (players.length < 2) {
    DeleteMessage(m);
    return;
  }

  const ids = players.map((player) => player.user_id);

  const winRates = await PlayerModel.find({
    user_id: { $in: ids },
  });

  const playersMmr = {};
  winRates.forEach((player) => {
    playersMmr[player.user_id] =
      player.win_rate * 100 + (player.link_elo || 0) / 100;
  });

  players.forEach((player) => {
    if (playersMmr[player.user_id] === undefined)
      playersMmr[player.user_id] = 50;
  });

  const limit = 15;
  const range = 5;

  let difference;
  let teams;
  let teamsMmr;
  let blockeds;

  let bestSort = {
    difference: false,
    teams: {},
    teamsMmr: {},
  };

  let count = 0;
  do {
    players = players.sort(() => Math.random() - 0.5);

    teams = {
      attacker: [],
      defender: [],
    };

    players.forEach((player, index) => {
      const attacker = index % 2 === 0;
      teams[attacker ? "attacker" : "defender"].push({
        user_id: player.user_id,
        attacker,
      });
    });

    teamsMmr = {};
    for (let type in teams) {
      const team = teams[type];
      teamsMmr[type] =
        team.reduce((total, player) => total + playersMmr[player.user_id], 0) /
        team.length;
    }

    blockeds = [];
    for (let type in teams) {
      const ids = teams[type].map((player) => player.user_id);

      const teamBlockeds = await BlockedPlayerModel.find({
        user_id: { $in: ids },
        blocked_id: { $in: ids },
      });

      if (teamBlockeds.length > 0) blockeds.push(type);
    }

    difference = Math.abs(teamsMmr["attacker"] - teamsMmr["defender"]);

    count++;

    if (bestSort.difference === false || difference < bestSort.difference) {
      bestSort.teams = teams;
      bestSort.teamsMmr = teamsMmr;
      bestSort.difference = difference;
    }
  } while ((difference > range || blockeds.length > 0) && count <= limit);

  if (count >= limit) {
    teams = bestSort.teams;
    teamsMmr = bestSort.teamsMmr;
  }

  const sorts = await SortMatchModel.find({
    match_id: match._id,
  });

  await Promise.all(
    sorts.map(async (sort) => {
      await DeleteMessage(sort.message_id, channel);
      await PlayerSortMatchModel.deleteMany({ sort_id: sort._id });
    })
  );

  await SortMatchModel.deleteMany({
    match_id: match._id,
  });

  const newSort = await SortMatchModel.create({
    match_id: match._id,
    message_id: m.id,
  });

  if (!newSort) {
    DeleteMessage(m);
    return;
  }

  for (let type in teams) {
    const team = teams[type];

    let maxWinRate = 0;
    let captainIndex = null;

    team.forEach((player, index) => {
      const winRate = playersMmr[player.user_id];

      team[index].sort_id = newSort._id;
      team[index].captain = false;
      team[index].win_rate = winRate;

      if (winRate > maxWinRate) {
        maxWinRate = winRate;
        captainIndex = index;
      }
    });

    if (captainIndex !== null) {
      team[captainIndex].captain = true;
    }
  }

  const guild = reaction.message.guild;
  const members = await guild.members.fetch();

  const mentions = {};
  for (let key in teams) {
    const team = teams[key];

    await PlayerSortMatchModel.create(team);

    mentions[key] = team.map(async (player) => {
      const elo = await MemberElo({
        user: player.user_id,
        guild,
        members,
      });

      return `${userMention(player.user_id)} (${player.win_rate.toFixed(
        0
      )} mmr) ${player.captain ? "🎖️" : ""} ${elo.emoji || ""}`;
    });
  }

  const sidesNames = {
    attacker: `A팀 (${teamsMmr["attacker"].toFixed(0)} MMR)`,
    defender: `B팀 (${teamsMmr["defender"].toFixed(0)} MMR)`,
  };

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("플레이어 정렬 완료")
    .setDescription(
      `회원 ${userMention(
        user.id
      )}님이 플레이어들을 정렬하셨습니다 ${EmbedWhiteSpace()}`
    )
    .addFields(
      {
        name: sidesNames.attacker,
        value:
          (await Promise.all(mentions.attacker)).join("\n") + EmbedWhiteSpace(),
        inline: true,
      },
      {
        name: sidesNames.defender,
        value:
          (await Promise.all(mentions.defender)).join("\n") + EmbedWhiteSpace(),
        inline: true,
      }
    )
    .setFooter({
      text: `🎖️ 표시는 각 팀의 주장을 나타냅니다`,
    });

  await m.edit({
    embeds: [embed2],
  });

  await m.react("▶️");

  RemoveReaction(reaction, user);
}

module.exports = sortPlayers;
