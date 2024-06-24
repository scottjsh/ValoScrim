const {
  EmbedBuilder,
  ChannelType,
  userMention,
  PermissionsBitField,
} = require("discord.js");

const MatchModel = require("../../models/Match");
const PlayerSortMatchModel = require("../../models/PlayerSortMatch");
const SortMatchModel = require("../../models/SortMatch");
const ChannelMatchModel = require("../../models/ChannelMatch");
const MapSortMatchModel = require("../../models/MapSortMatch");

const EmbedWhiteSpace = require("../../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../../helpers/DeleteMessage");
const MemberElo = require("../../helpers/MemberElo");

async function play(client, reaction, user, add) {
  if (!add) return;

  const channel = client.channels.cache.get(reaction.message.channelId);

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("게임 시작 중")
    .setDescription("`잠시만 기다려 주세요...`");

  const m = await channel.send({
    embeds: [embed1],
  });

  const sort = await SortMatchModel.findOne({
    message_id: reaction.message.id,
  });

  if (!sort) {
    DeleteMessage(m);
    return;
  }

  const match = await MatchModel.findOne({
    _id: sort.match_id,
  });

  if (!match || match.creator_id !== user.id) {
    DeleteMessage(m);
    return;
  }

  const players = await PlayerSortMatchModel.find({
    sort_id: sort._id,
  });

  const guild = reaction.message.guild;

  const role = await guild.roles.create({
    name: `게임 중`,
    reason: `게임 중인 매치 ${match._id}`,
  });

  const everyone = guild.roles.cache.find((r) => r.name === "@everyone");

  const category = await guild.channels.create({
    name: `매치 ${match._id}`,
    type: ChannelType.GuildCategory,
    permissionOverwrites: [
      {
        id: everyone.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: role.id,
        allow: [PermissionsBitField.Flags.ViewChannel],
      },
    ],
  });

  const ca = await guild.channels.create({
    name: "팀 A",
    type: ChannelType.GuildVoice,
    parent: category.id,
    userLimit: match.player_limit ? match.player_limit : false,
  });

  const cb = await guild.channels.create({
    name: "팀 B",
    type: ChannelType.GuildVoice,
    parent: category.id,
    userLimit: match.player_limit ? match.player_limit : false,
  });

  const teams = {
    attacker: [],
    defender: [],
  };

  for (let player of players) {
    const member = await guild.members.cache.get(player.user_id);

    if (member && member.voice.channel)
      await member.voice.setChannel(player.attacker ? ca : cb);

    if (member) await member.roles.add(role.id);

    teams[player.attacker ? "attacker" : "defender"].push(player);
  }

  const channels = [ca, cb];
  channels.forEach(async (channel) => {
    await ChannelMatchModel.create({
      match_id: match._id,
      channel_id: channel.id,
    });
  });

  const map = await MapSortMatchModel.findOne({
    match_id: match._id,
  });

  DeleteMessage(reaction.message);
  DeleteMessage(match.message_id, reaction.message.channel);

  const members = await guild.members.fetch();

  let mentions = {};
  for (let key in teams) {
    const team = teams[key];

    await PlayerSortMatchModel.create(team);

    mentions[key] = [];
    for (let player of team) {
      const elo = await MemberElo({
        user: player.user_id,
        guild,
        members,
      });

      mentions[key].push(
        `${userMention(player.user_id)} ${player.captain ? "🎖️" : ""} ${
          elo.emoji ? elo.emoji : ""
        }`
      );
    }
  }

  await MatchModel.findOneAndUpdate(
    {
      _id: match._id,
    },
    {
      result_id: m.id,
      role_id: role.id,
      category_id: category.id,
    }
  );

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("게임 시작됨")
    .setDescription(
      `회원 ${userMention(
        user.id
      )}님이 게임을 시작했습니다 ${EmbedWhiteSpace()}`
    )
    .addFields(
      {
        name: "맵",
        value: `${map ? map.name : "미정"} ${EmbedWhiteSpace()}`,
      },
      {
        name: "🅰️ - A팀",
        value: mentions.attacker.join("\n") + EmbedWhiteSpace(),
        inline: true,
      },
      {
        name: "🅱️ - B팀",
        value: mentions.defender.join("\n") + EmbedWhiteSpace(),
        inline: true,
      },
      {
        name: "결과 등록 방법",
        value: `
                    🅰️ 또는 🅱️에 투표하여 게임 결과를 등록하세요.
                    
                    **주의 사항:**
                    • 🎖️ 주장만 결과를 등록할 수 있습니다.
                    • 양쪽 모두 투표해야 결과가 등록됩니다.
                `,
      }
    )
    .setFooter({
      text: `매치 ID: ${match._id}`,
    });

  await m.edit({
    embeds: [embed2],
  });

  await m.react("🅰️");
  await m.react("🅱️");
}

module.exports = play;
