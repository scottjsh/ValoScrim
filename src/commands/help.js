const { EmbedBuilder } = require("discord.js");

const { prefix } = require("../../configs.json");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../helpers/DeleteMessage");

async function help(client, msg, args) {
  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("명령어 목록 요청 중")
    .setDescription("`잠시만 기다려 주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("봇 사용 방법")
    .setDescription(
      `회원 ${msg.author}가 지원을 요청했습니다 ${EmbedWhiteSpace()}`
    )
    .addFields([
      {
        name: "내전 생성",
        value: `${prefix}create \`팀 당 인원수\``,
      },
      {
        name: "내전 정보 보기",
        value: `${prefix}matches \`유저멘션\``,
      },
      {
        name: "플레이어 정보 보기",
        value: `${prefix}player \`유저멘션\``,
      },
      {
        name: "플레이어 목록 보기",
        value: `${prefix}players \`page\` \`configs\``,
      },
      {
        name: "👑플레이어의 승률 조작",
        value: `${prefix}setmatches \`user_mention*\` \`matches_won*\` \`matches*\``,
      },
      {
        name: "플레이어 차단",
        value: `${prefix}block \`user_id*\``,
      },
      {
        name: "플레이어 차단 해제",
        value: `${prefix}unblock \`user_id*\``,
      },
      {
        name: "차단된 플레이어 목록",
        value: `${prefix}blockeds`,
      },
      {
        name: "계정 연결",
        value: `${prefix}link \`name#tag\``,
      },
      {
        name: "연결된 계정 업데이트",
        value: `${prefix}update`,
      },
      {
        name: "계정 연결 해제",
        value: `${prefix}unlink`,
      },
      {
        name: "맵 추첨",
        value: `${prefix}sortmap`,
      },
      {
        name: "맵 랭킹",
        value: `${prefix}ranking \`map*\``,
      },
      {
        name: "명령어 보기",
        value: `${prefix}help`,
      },
      {
        name: "핑 보기",
        value: `${prefix}ping`,
      },
      // {
      //   name: "비공개 방 생성",
      //   value: `${prefix}private`,
      // },
      {
        name: "요원 능력 보기",
        value: `${prefix}agent \`요원이름*\` \`언어\``,
      },
      {
        name: "현재 버전 보기",
        value: `${prefix}version ${EmbedWhiteSpace()}`,
      },
      {
        name: `알림:`,
        value: `
                - \`*\`가 있는 변수는 필수입니다
                - \`👑\`가 있는 명령어는 관리자만 실행할 수 있습니다
                - \`🛠️\`가 있는 명령어는 개발 중입니다`,
      },
    ]);

  m.edit({
    embeds: [embed2],
  });
}

module.exports = help;
