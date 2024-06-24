const MapSortModel = require("../models/MapSort");
const fetch = require("node-fetch");

async function SortMap() {
  return new Promise(async (resolve, reject) => {
    const url = "https://valorant-api.com/v1/maps";

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `맵을 불러오는 데 실패했습니다. 상태 코드: ${response.status}`
        );
      }

      const sorts = await MapSortModel.find().sort({ created_at: -1 });
      const drawn = sorts.map((sort) => sort.uuid);

      const data = await response.json();
      if (data.status !== 200) {
        throw new Error(`API에서 오류 상태를 반환했습니다: ${data.status}`);
      }

      let maps = data.data.filter((map) => map.callouts);

      maps.sort(() => Math.random() - 0.5);

      const limit = maps.length;
      let map;
      let count = 0;
      let sorted = false;

      do {
        const randomIndex = Math.floor(Math.random() * maps.length);
        map = maps[randomIndex];

        await MapSortModel.create({
          uuid: map.uuid,
        });

        count++;
        if (drawn.includes(map.uuid) && count < limit) {
          maps.splice(randomIndex, 1);
        } else {
          sorted = true;
        }
      } while (!sorted);

      if (count >= limit) {
        await MapSortModel.deleteMany({
          uuid: { $in: drawn },
        });
      }

      resolve(map);
    } catch (err) {
      console.error("맵 정렬 중 오류 발생:", err);
      reject(err);
    }
  });
}

module.exports = SortMap;
