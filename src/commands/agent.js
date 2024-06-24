const { EmbedBuilder } = require("discord.js");

const AgentModel = require("../models/Agent");
const VAPI = require("../helpers/ValorantAPI");

const EmbedWhiteSpace = require("../helpers/EmbedWhiteSpace");
const DeleteMessage = require("../helpers/DeleteMessage");

async function agent(client, msg, args) {
  let name = args.join(" ");

  const embed1 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle("요원 검색 중")
    .setDescription("`잠시만 기다려 주세요...`");

  const m = await msg.reply({
    embeds: [embed1],
  });

  if (!name) {
    DeleteMessage(m);
    return;
  }

  name = name.toLowerCase();

  let infos = await AgentModel.findOne({
    name,
  });

  if (!infos) {
    const obj = await VAPI.getAgents({
      language: "ko-KR",
      playable: true,
    });

    if (obj.error) {
      console.log(`API 오류 ${obj.status}`, obj.errors);

      DeleteMessage(m);
      return;
    }

    const agents = obj.data;

    agents.forEach((agent) => {
      if (agent.displayName.toLowerCase() == name) {
        infos = agent;
        return;
      }
    });

    if (!infos) {
      DeleteMessage(m);
      return;
    }

    await AgentModel.create({
      uuid: infos.uuid,
      name: infos.displayName.toLowerCase(),
    });
  } else {
    const obj = await VAPI.getAgent({
      agent_id: infos.uuid,
      language: "ko-KR",
    });

    if (obj.error) {
      console.log(`API 오류 ${obj.status}`, obj.errors);

      DeleteMessage(m);
      return;
    }

    infos = obj.data;
  }

  const slots = {
    names: {
      Ability1: "Q",
      Ability2: "E",
      Grenade: "C",
      Ultimate: "X",
    },
    position: ["Q", "E", "C", "X"],
  };

  const abilities = [];
  infos.abilities.forEach((ability, index) => {
    let key;

    if (slots[ability.slot]) key = slots.names[ability.slot];
    else key = slots.position[index];

    abilities.push({
      name: `${key}: ${ability.displayName}`,
      value: ability.description,
    });
  });

  const emoji = await msg.guild.emojis.cache.find(
    (emoji) => emoji.name === `pos_${infos.role.displayName.toLowerCase()}`
  );

  const embed2 = new EmbedBuilder()
    .setColor("Random")
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTitle(infos.displayName)
    .setDescription(infos.description)
    .setThumbnail(infos.displayIcon)
    .addFields([
      {
        name: "역할",
        value: `${emoji} ${infos.role.displayName} ${EmbedWhiteSpace()}`,
      },
      ...abilities,
      {
        name: "비디오 및 팁:",
        value: `https://blitz.gg/valorant/agents/${infos.displayName.toLowerCase()}`,
      },
    ]);

  await m.edit({
    embeds: [embed2],
  });
}

module.exports = agent;
