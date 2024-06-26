const { createCanvas, loadImage, registerFont } = require("canvas");

async function ResultImage(match) {
  const width = 915;
  const height = 630;
  const padding = 15;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  registerFont("./src/fonts/Poppins-Regular.ttf", {
    family: "Poppins",
  });

  registerFont("./src/fonts/Poppins-SemiBold.ttf", {
    family: "Poppins SemiBold",
  });

  registerFont("./src/fonts/Poppins-Bold.ttf", {
    family: "Poppins Bold",
  });

  const map = match.metadata.map;
  const score = [match.teams.red.rounds_won, match.teams.blue.rounds_won];

  const date = new Date(match.metadata.game_start_patched);
  date.setUTCHours(0);
  date.setHours(date.getHours() + 9);

  const day = date.getDate();
  const month = date.getMonth() + 1; // JavaScript에서 월은 0부터 시작하므로 1을 더해줍니다.
  const str_date = `${day < 10 ? `0${day}` : day}/${
    month < 10 ? `0${month}` : month
  }/${date.getFullYear()}`;

  // 배경 이미지 불러오기
  try {
    const bg = await loadImage(`src/images/map_bg_${map.toLowerCase()}.png`);
    context.drawImage(bg, 0, 0, width, height);
  } catch (err) {
    context.fillStyle = "#141414";
    context.fillRect(0, 0, width, height);
  }

  context.textBaseline = "top";

  // 팀 이름 제목
  context.font = "50pt Poppins Bold";
  context.fillStyle = "#fff";

  const teams_names = ["팀 A".toUpperCase(), "팀 B".toUpperCase()];

  context.textAlign = "left";
  context.fillText(teams_names[0], padding, padding + 6);

  context.textAlign = "right";
  context.fillText(teams_names[1], width - padding, padding + 6);

  // 결과 제목
  context.font = "12pt Poppins";

  const texts = {
    left: match.teams.red.has_won ? "승리" : "패배",
    right: match.teams.blue.has_won ? "승리" : "패배",
  };

  const colors = {
    left: "#0DB095",
    right: "#FD4454",
  };

  context.textAlign = "left";
  context.fillStyle = colors.left;
  context.fillText(texts.left, padding, padding);

  context.textAlign = "right";
  context.fillStyle = colors.right;
  context.fillText(texts.right, width - padding, padding);

  // 점수 제목
  context.font = "62pt Poppins Bold";

  context.textAlign = "right";
  context.fillStyle = "#0DB095";
  context.fillText(score[0], width / 2 - padding, padding - 12);

  context.textAlign = "left";
  context.fillStyle = "#FD4454";
  context.fillText(score[1], width / 2 + padding, padding - 12);

  context.font = "16pt Poppins Bold";
  context.textAlign = "center";
  context.fillStyle = "#FFF";
  context.fillText("X", width / 2, padding + 62 / 2);

  context.font = "12pt Poppins";
  context.fillText(map, width / 2, padding * 7.25 - 12 / 2);

  context.font = "10pt Poppins";
  context.fillText(str_date, width / 2, padding * 7.25 - 12 / 2 + 24);

  const teams = [match.players.red, match.players.blue];

  for (let index in teams) {
    const team = teams[index];

    for (let prop in team) {
      const player = team[prop];
      const sizes = {
        agent: 65,
        card: 230,
        kda: 28,
        padding: padding * 7.25,
      };

      const agent = await loadImage(player.assets.agent.small);
      context.drawImage(
        agent,
        index == 0 ? padding : width - padding - sizes.agent,
        sizes.padding + sizes.agent * prop + 10 * prop + prop * sizes.kda,
        sizes.agent,
        sizes.agent
      );

      const card = await loadImage(player.assets.card.wide);
      context.drawImage(
        card,
        index == 0
          ? padding + sizes.agent
          : width - padding - sizes.card - sizes.agent,
        sizes.padding + sizes.agent * prop + 10 * prop + prop * sizes.kda,
        sizes.card,
        sizes.agent
      );

      const shadow = await loadImage("src/images/card_shadow.png");
      context.drawImage(
        shadow,
        index == 0
          ? padding + sizes.agent
          : width - padding - sizes.card - sizes.agent,
        sizes.padding + sizes.agent * prop + 10 * prop + 1 + prop * sizes.kda,
        sizes.card,
        sizes.agent
      );

      context.textBaseline = "bottom";
      context.textAlign = index == 0 ? "left" : "right";

      context.font = "12pt Poppins";
      context.fillStyle = "#fff";
      context.fillText(
        player.character,
        index == 0
          ? padding + sizes.agent + 10
          : width - padding - sizes.agent - 10,
        sizes.padding + (sizes.agent + sizes.kda + 10) * prop + sizes.agent - 22
      );

      context.font = "16pt Poppins SemiBold";
      context.fillStyle = index == 0 ? colors.left : colors.right;
      context.fillText(
        player.name,
        index == 0
          ? padding + sizes.agent + 10
          : width - padding - sizes.agent - 10,
        sizes.padding + (sizes.agent + sizes.kda + 10) * prop + sizes.agent
      );

      context.fillRect(
        index == 0 ? padding : width - padding - sizes.card - sizes.agent,
        sizes.padding +
          sizes.agent * prop +
          10 * prop +
          sizes.agent +
          prop * sizes.kda,
        sizes.agent + sizes.card,
        sizes.kda
      );

      context.font = "12pt Poppins";
      context.fillStyle = "#141414";
      context.fillText(
        `${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}`,
        index == 0 ? padding + sizes.agent : width - padding - sizes.agent,
        sizes.padding +
          sizes.agent * prop +
          10 * prop +
          sizes.agent +
          prop * sizes.kda +
          26,
        sizes.agent + sizes.card
      );

      context.font = "12pt Poppins SemiBold";
      context.fillText(
        `${(
          (player.stats.kills + player.stats.assists) /
          (player.stats.deaths == 0 ? 1 : player.stats.deaths)
        ).toFixed(2)}`,
        index == 0 ? padding + 10 : width - padding - 10,
        sizes.padding +
          sizes.agent * prop +
          10 * prop +
          sizes.agent +
          prop * sizes.kda +
          26,
        sizes.agent + sizes.card
      );
    }
  }

  const buffer = canvas.toBuffer("image/png");

  return buffer;
}

module.exports = ResultImage;
