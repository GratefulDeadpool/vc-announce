const Discord = require("discord.js");
const bot = new Discord.Client();

var lastTime = 2.25;
var coolDown = 0.75;
var lastCooldown = coolDown;
var quietHours = false;
var post = process.env.postChan;
var roles = [
  process.env.role1,
  process.env.role2,
  process.env.role3,
  process.env.role4,
  process.env.role5,
];

bot.login(process.env.TOKEN);

bot.on("ready", () => {
  console.log("I am ready!");
});

bot.on("message", (message) => {
  if (
    !message.content.startsWith("%") ||
    !message.member.hasPermission("ADMINISTRATOR") ||
    message.author.bot
  ) {
    return;
  }
  const args = message.content.slice(1).trim().split(" ");
  const command = args.shift().toLowerCase();
  if (command === "set-cooldown") {
    if (args.length < 1) {
      return message.channel.send(`You didn't provide enough arguments!`);
    } else {
      coolDown = parseInt(args[0]);
      return message.channel.send(`Cooldown is now ` + coolDown + " hours");
    }
  }
  if (command === "quiet-hours") {
    if (quietHours) {
      coolDown = lastCooldown;
      quietHours = false;
      return message.channel.send(`Quiet hours deactivated`);
    } else {
      lastCooldown = coolDown;
      coolDown = 23.999;
      quietHours = true;
      return message.channel.send(`Quiet hours activated`);
    }
  }
  if (command === "channel") {
    if (args.length < 1) {
      return message.channel.send(`You didn't provide enough arguments!`);
    } else {
      post = String(args[0]).replace(/\D/g, "");
      console.log(post);
      return message.channel.send(`Channel set!`);
    }
  }
  if (command === "roles") {
    if (args.length < 5) {
      return message.channel.send(`You didn't provide enough arguments!`);
    } else {
      roles = args;
      console.log(roles);
      return message.channel.send(`Roles set!`);
    }
  }
});

bot.on("voiceStateUpdate", (oldMember, newMember) => {
  let newUserChannel = newMember.channel;
  let oldUserChannel = oldMember.channel;
  let time = new Date();
  let currTime = time.getHours() + time.getMinutes() / 60.0;
  let roleNotify = roles[0];
  if (
    oldUserChannel === null &&
    newUserChannel !== null &&
    currTime - lastTime >= coolDown &&
    post != null &&
    roles != []
  ) {
    lastTime = currTime;
    if (currTime >= 8.0 && currTime < 12.0) {
      roleNotify = roles[0];
    } else if (currTime < 15.0) {
      roleNotify = roles[1];
    } else if (currTime < 17.0) {
      roleNotify = roles[2];
    } else if (currTime < 20.0) {
      roleNotify = roles[3];
    } else if (currTime < 24.0) {
      roleNotify = roles[4];
    }
    if (currTime >= 8.0 && currTime < 24.0) {
      bot.channels.cache
        .get(post)
        .send(
          roleNotify +
            " || <@" +
            newMember +
            "> wants to voicechat in <#" +
            newUserChannel +
            ">!"
        );
    } else {
      bot.channels.cache
        .get(post)
        .send(
          "https://media1.tenor.com/images/2b6d390d6d178ba70479bf3cbafdfd65/tenor.gif?itemid=10318105"
        );
    }
  }
});
