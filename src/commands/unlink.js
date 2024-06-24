const { EmbedBuilder } = require("discord.js");

const PlayerModel = require("../models/Player");
const PlayerSortMatchModel = require("../models/PlayerSortMatch");
const VoteResultMatchModel = require("../models/VoteResultMatch");
const SortMatchModel = require("../models/SortMatch");

async function unlink(client, msg, args) {
  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("계정 연결 해제 중")
    .setDescription("`잠시 기다려주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  const verify = await PlayerModel.findOne({
    user_id: msg.author.id,
  });

  if (!verify || !verify.link_id) {
    const embed2 = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("계정이 연결되지 않았습니다")
      .setDescription(`연결된 계정이 없습니다.`);

    m.edit({
      embeds: [embed2],
    });

    return;
  }

  await PlayerModel.findOneAndUpdate(
    {
      user_id: msg.author.id,
    },
    {
      matches: null,
      matches_won: null,
      win_rate: null,
      link_id: null,
      link_region: null,
      link_elo: null,
      link_date: null,
    }
  );

  const sorts = await PlayerSortMatchModel.find({
    user_id: msg.author.id,
  }).limit(15);

  const matches = [];
  for (let prop in sorts) {
    const sort = sorts[prop];

    const match = await SortMatchModel.findOne({
      _id: sort.sort_id,
    });

    if (match) {
      matches.push({
        id: match.match_id,
        sort: sort._id,
        attacker: sort.attacker,
      });
    }
  }

  for (let prop in matches) {
    const match = matches[prop];

    await PlayerSortMatchModel.deleteMany({
      _id: match.sort,
      user_id: msg.author.id,
    });
    await VoteResultMatchModel.deleteMany({
      match_id: match.id,
      user_id: msg.author.id,
    });
  }

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("계정 연결 해제 완료")
    .setDescription(
      `멤버 ${msg.author}님이 **VALORANT** 계정을 성공적으로 연결 해제했습니다.`
    );

  m.edit({
    embeds: [embed2],
  });
}

module.exports = unlink;
