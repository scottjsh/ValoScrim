const { EmbedBuilder, userMention } = require("discord.js");

const PlayerSortMatchModel = require("../models/PlayerSortMatch");
const MapSortMatchModel = require("../models/MapSortMatch");
const VoteResultMatchModel = require("../models/VoteResultMatch");
const SortMatchModel = require("../models/SortMatch");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../helpers/DeleteMessage");
const MemberElo = require("../helpers/MemberElo");

async function ranking(client, msg, args) {
  let [map] = args;

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("랭킹 목록")
    .setDescription("`잠시 기다려 주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  if (map) {
    const ms = [];

    map = map.toLowerCase();
    map = map.charAt(0).toUpperCase() + map.slice(1);

    let count = 0;

    const matchs = await MapSortMatchModel.find({
      name: map,
    }).limit(50);

    if (matchs.length == 0) {
      DeleteMessage(m);
      return;
    }

    for (let match of matchs) {
      const sorts = await SortMatchModel.find({
        match_id: match.match_id,
      });

      let players;
      for (let sort of sorts) {
        players = await PlayerSortMatchModel.find({
          sort_id: sort._id,
        });
      }

      const result = await VoteResultMatchModel.findOne({
        match_id: match.match_id,
      });

      if (result) {
        count++;

        const obj = {
          match_id: match.match_id,
          players: {
            w: [],
            l: [],
          },
        };

        for (let player of players) {
          obj.players[player.attacker === result.attacker ? "w" : "l"].push(
            player
          );
        }

        ms.push(obj);
      }
    }

    const players = {};
    for (let match of ms) {
      for (let type in match.players) {
        const p = match.players[type];

        for (let player of p) {
          if (!players[player.user_id]) {
            players[player.user_id] = {
              w: 0,
              l: 0,
            };
          }

          players[player.user_id][type]++;
        }
      }
    }

    const org = [];
    for (let id in players) {
      const player = players[id];

      const t = player.w + player.l;
      const wr = player.w / t;

      org.push({
        id,
        w: player.w,
        l: player.l,
        t,
        wr,
      });
    }

    org.sort((a, b) => {
      return a.w > b.w ? -1 : 1;
    });

    org.sort((a, b) => {
      return a.wr > b.wr ? -1 : 1;
    });

    const members = await msg.guild.members.fetch();

    const limit = 10;
    const ranking = [];
    for (let index in org) {
      if (index < limit) {
        const player = org[index];

        const elo = await MemberElo({
          guild: msg.guild,
          user: player.id,
          members,
        });

        ranking.push(
          `${parseInt(index) + 1}위 - ${userMention(player.id)} | ${(
            player.wr * 100
          ).toFixed(0)}% \`(${player.w}/${player.t})\` ${elo.string}`
        );
      }
    }

    const embed2 = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle(`**${map}** 랭킹`)
      .setDescription(`선택한 맵의 최고의 플레이어들 \`(${count} 경기)\``)
      .addFields({
        name: "목록",
        value: ranking.join("\n") + EmbedWhiteSpace(),
      })
      .setFooter({
        text: "⚠️ 랭킹은 선택한 맵에서 플레이어의 승률을 기반으로 합니다. 괄호 안의 숫자는 승리 수와 총 경기 수를 나타냅니다.",
      });

    await m.edit({
      embeds: [embed2],
    });
  } else {
    DeleteMessage(m);
  }
}

module.exports = ranking;
