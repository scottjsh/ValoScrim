const { EmbedBuilder } = require("discord.js");

const PlayerModel = require("../models/Player");
const { prefix } = require("../../configs.json");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../helpers/DeleteMessage");
const LinkAccount = require("../helpers/LinkAccount");

async function link(client, msg, args) {
  const name_tag = args.join(" ");

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("계정 연결 중")
    .setDescription("`잠시만 기다려 주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  if (!name_tag) {
    DeleteMessage(m);
    return;
  }

  const split = name_tag.split("#");

  if (split.length != 2) {
    DeleteMessage(m);
    return;
  }

  const [name, tag] = split;

  const verify = await PlayerModel.findOne({
    user_id: msg.author.id,
  });

  if (verify && verify.link_id) {
    const embed2 = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("계정 연결 실패")
      .setDescription(
        `이미 계정이 연결되어 있습니다. 연결을 해제하시려면 \`${prefix}unlink\` 명령어를 사용하세요.`
      );

    m.edit({
      embeds: [embed2],
    });

    return;
  }

  LinkAccount({ name, tag, msg })
    .then((res) => {
      const { account, mmr, tier } = res;

      const embed2 = new EmbedBuilder()
        .setColor("Random")
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTitle("계정 연결 완료")
        .setDescription(
          `회원 ${msg.author}님의 계정이 연결되었습니다 ${EmbedWhiteSpace()}`
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
      console.log(err);
      if (err.status != 404) console.log(`API 오류 ${err.status}`, err.errors);

      let error_msg;
      if (err.status == 404) error_msg = "사용자를 찾을 수 없습니다";
      else error_msg = "내부 오류, 나중에 다시 시도하세요";

      const embed2 = new EmbedBuilder()
        .setColor("Random")
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTitle("계정 연결 실패")
        .setDescription(error_msg);

      m.edit({
        embeds: [embed2],
      });
    });
}

module.exports = link;
