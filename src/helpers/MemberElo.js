const tiersList = require("../jsons/tiersList.json");

function MemberElo({ user, emoji = true, members = false, guild }) {
  return new Promise(async (resolve, reject) => {
    try {
      let member;

      if (!members && guild) member = await guild.members.fetch(user);
      else member = members.find((member) => member.user.id == user);

      const tiers = [];
      for (let prop in tiersList) {
        tiers.push(tiersList[prop]);
      }

      if (!member) resolve(false);

      let name;
      if (member) {
        const elo = await member.roles.cache.find((role) =>
          tiers.includes(role.name)
        );
        name = elo ? elo.name : false;

        if (elo && emoji) {
          emoji = await guild.emojis.cache.find(
            (emoji) => emoji.name === `elo_${name.toLowerCase()}`
          );
          emoji = emoji ? emoji : false;
        } else {
          emoji = false;
        }
      }

      const string = name ? (emoji ? emoji : `\`${name}\``) : "";

      resolve({
        name,
        emoji,
        string,
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = MemberElo;
