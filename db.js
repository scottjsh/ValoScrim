const mongoose = require("mongoose");
const { dbUser, dbPass } = require("./configs.json");

mongoose.set("strictQuery", true);

const connectDatabase = async () => {
  mongoose
    .connect(
      `mongodb+srv://${dbUser}:${encodeURIComponent(
        dbPass
      )}@database.ukzxlox.mongodb.net/?retryWrites=true&w=majority&appName=database`
    )
    .then(() => {
      console.log("MongoDB Connect");
    })
    .catch((err) => console.log(err));
};

module.exports = connectDatabase;
