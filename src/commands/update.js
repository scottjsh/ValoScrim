const { EmbedBuilder } = require("discord.js");

const PlayerModel = require("../models/Player");
const { prefix } = require("../../configs.json");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");
const LinkAccount = require("../helpers/LinkAccount");

async function update(client, msg, args) {
  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("계정 업데이트 중")
    .setDescription("`잠시 기다려주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  const player = await PlayerModel.findOne({
    user_id: msg.author.id,
  });

  if (player && !player.link_id) {
    const embed2 = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("계정 업데이트 실패")
      .setDescription(
        `귀하의 계정에 연결된 계정이 없습니다. \`${prefix}link {name}#{tag}\` 명령어를 사용하여 계정을 연결해보세요.`
      );

    m.edit({
      embeds: [embed2],
    });

    return;
  }

  const puuid = player.link_id;

  LinkAccount({ puuid, msg })
    .then((res) => {
      const { account, mmr, tier } = res;

      const embed2 = new EmbedBuilder()
        .setColor("Random")
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTitle("계정 업데이트 완료")
        .setDescription(
          `멤버 ${msg.author}님이 계정을 업데이트했습니다. ${EmbedWhiteSpace()}`
        )
        .addFields([
          {
            name: "사용자명",
            value: `${account.name}#${account.tag}`,
            inline: true,
          },
          {
            name: "레벨",
            value: `${account.account_level}`,
            inline: true,
          },
          {
            name: "실제 티어",
            value: `${
              mmr.elo ? `${tier.translated} ${tier.division}` : "티어 없음"
            }`,
            inline: true,
          },
        ])
        .setImage(account.card.wide)
        .setThumbnail(mmr.elo ? mmr.images.large : account.card.small);

      m.edit({
        embeds: [embed2],
      });
    })
    .catch((err) => {
      if (err.status != 404) console.log(`API 오류 ${err.status}`, err.errors);

      let error_msg;
      if (err.status == 404) error_msg = "사용자를 찾을 수 없습니다.";
      else error_msg = "내부 오류, 나중에 다시 시도해주세요.";

      const embed2 = new EmbedBuilder()
        .setColor("Random")
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTitle("계정 업데이트 실패")
        .setDescription(error_msg);

      m.edit({
        embeds: [embed2],
      });
    });
}

module.exports = update;
