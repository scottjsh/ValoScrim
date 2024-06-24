# ValoScrim - 발로란트 내전 봇

## 봇 환경 설정 및 시작

간단하게 **ValoScrim**을 실행시킬 수 있습니다.

### 전역 의존성

- Node.js (v21.7.1 버전에서 개발됨)

### 로컬 의존성

이 리포를 다운로드한 후 Node Module을 설치하십시오:

```
npm install
```

### 봇 설정

디스코드 개발자 포털에서 애플리케이션을 생성하고 Bot 탭에서 `MESSAGE CONTENT INTENT`을 켜주세요.

### DB 설정

이 봇은 `MongoDB`를 사용함으로 `MongoDB`서버가 필요합니다. `db.js`를 다음과 같이 설정하십시오:

> 만약 `MongoDB`에서 발급받은 서버주소가  
> `mongodb+srv://ID:PASSWORD@database.ukzxlox.mongodb.net/?retryWrites=true&w=majority&appName=database`  
> 이라면 다음과 같이 작성 후 `config.json`의 dbUser에 "ID", dbPass에 "PASSWORD"를 작성합니다.

> ```js
> const mongoose = require("mongoose");
> const { dbUser, dbPass } = require("./configs.json");
>
> mongoose.set("strictQuery", true);
>
> const connectDatabase = async () => {
>   mongoose
>     .connect(
>       `mongodb+srv://${dbUser}:${encodeURIComponent(
>         dbPass
>       )}@database.ukzxlox.mongodb.net/?retryWrites=true&w=majority&appName=database`
>     )
>     .then(() => {
>       console.log("MongoDB Connect");
>     })
>     .catch((err) => console.log(err));
> };
>
> module.exports = connectDatabase;
> ```

### `config.json` 생성

로컬 및 전역 의존성을 모두 설치한 후, 봇을 시작하기 위한 데이터를 포함하는 `config.json` 파일을 설정하십시오.  
`config.json.example`파일을 참고하여 작성해주세요.

> 봇 토큰을 얻는 방법을 모르겠다면, [여기를 클릭하십시오](https://discordjs.guide/preparations/setting-up-a-bot-application.html)

### 봇 시작

모든 전역 및 로컬 의존성을 설치하고 `config.json`을 생성한 후, 봇을 시작하십시오:

```
npm start
```

### 봇 초대

`BOT PERMISSIONS`에 `Administrator`을 체크하여 원하는 서버에 초대하십시오.

> 초대 링크를 생성하는 방법을 모르겠다면, [여기를 클릭하십시오](https://discordjs.guide/preparations/adding-your-bot-to-servers.html)

### 참고

- 이 봇은 `MongoDB`를 사용합니다.
- 이 봇은 매일 00시에 모든 유저의 정보를 업데이트 합니다.  
  사용 유저가 많으면 상당한 양의 리소스가 사용되므로 서버 성능이 낮다면 `cronjob.js`을 다음과 같이 수정하십시오.

  > ```js
  > const cron = require("node-cron");
  >
  > const AutoUpdateLinkAccount = require("./src/helpers/AutoUpdateLinkAccount");
  >
  > async function cronjobs(client) {
  >   // 매일 00:00에 실행
  >   // cron.schedule("0 0 * * *", () => {
  >   //   AutoUpdateLinkAccount(client);
  >   // });
  > }
  >
  > module.exports = cronjobs;
  > ```
