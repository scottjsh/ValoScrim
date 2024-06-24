const {
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");

const DeleteMessage = require("../helpers/DeleteMessage");

async function private(client, msg) {
  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("개인 채널 생성 중")
    .setDescription("`잠시 기다려 주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  const guild = msg.guild;

  const category = await guild.channels.cache.get("1086335065157533737");

  const channel_name = `pv-${msg.author.id}`;

  let channel = await client.channels.cache.find(
    (c) => c.name === channel_name
  );

  if (!channel) {
    const everyone = guild.roles.cache.find((r) => r.name === "@everyone");

    await msg.guild.roles.cache.forEach(async (role) => {
      if (role.name === "혼자서 대화하기") {
        const has = await msg.member.roles.cache.has(role.id);

        if (has)
          role.delete().catch((err) => {
            if (err.status !== 404) console.log(err);
          });
      }
    });

    const role = await guild.roles.create({
      name: `혼자서 대화하기`,
    });

    channel = await guild.channels.create({
      name: channel_name,
      type: ChannelType.GuildText,
      parent: category.id,
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

    const member = await guild.members.cache.get(msg.author.id);

    if (member) await member.roles.add(role.id);
  }

  const seconds = 5;

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("개인 채널")
    .setDescription(
      `${msg.author}, **${category.name}** 카테고리에서 새로 생성된 개인 채널을 찾으세요 | ${channel}`
    )
    .setFooter({
      text: `⚠️ 개인 정보 보호를 위해 이 메시지는 생성 후 ${seconds}초 후에 삭제됩니다`,
    });

  await m.edit({
    embeds: [embed2],
  });

  setTimeout(() => {
    DeleteMessage(m);
  }, seconds * 1000);
}

module.exports = private;
