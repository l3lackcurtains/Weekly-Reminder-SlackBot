const SlackBot = require("slackbots");
const moment = require("moment");
const cron = require("node-cron");

const config = require("./config");

const bot = new SlackBot({
  token: config.apiToken,
  name: "WeeklyBlog"
});

// auto Notification date
const desiredWeekday = 6; // Saturday
const currentWeekday = moment().isoWeekday();
const missingDays = (desiredWeekday - currentWeekday + 7) % 7;
const desiredDay = moment().add(missingDays, "days");

// Starting the bot
bot.on("start", () => {
  cron.schedule("* 30 9 * * 5,6", notifyUserWeekly);
});

// bot error
bot.on("error", err => console.log(err));

// Messaging
bot.on("message", data => {
  if (data.type !== "message") {
    return;
  }

  handleMessage(data.text);
});

// reply to message
function handleMessage(message) {
  if (message.includes(" /info")) {
    sendInformation();
  }
}

// send next blog writing day
function sendInformation() {
  const dateFormatted = desiredDay.format("dddd, MMMM Do YYYY");
  bot.postMessageToChannel(
    "general",
    `You will write next blog at *${dateFormatted}*.`
  );
}

function notifyUserWeekly() {
  if (moment().isSame(moment(desiredDay).add(-1, "days"), "day")) {
    message =
      "Just a friendly reminder: Get ready for blog topic to write tomorrow! :sparkles:";

    bot.postMessageToChannel("general", message);
  } else if (moment().isSame(moment(desiredDay), "day")) {
    message = "Hey, It's the day, you have to start writing blog.";

    bot.postMessageToChannel("general", message);
  } else {
    return;
  }
}
