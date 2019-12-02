const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "mute",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    // match[] - msg content, ID, length:days?, length: hours?, length:minutes?, length:seconds?, reason 
    const match = /(?:mute)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+(?:(\d+)\s*d(?:ays)?)?\s*(?:(\d+)\s*h(?:ours|rs|r)?)?\s*(?:(\d+)\s*m(?:inutes|in)?)?\s*(?:(\d+)\s*s(?:econds|ec)?)?)(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: mute <user-id/mention> <#d#h#m#s> <reason>");

    const gSettings = this.client.db.settings.get(message.guild.id);

    let detCat = gSettings["detentioncategory"];
    let muteRole = gSettings["mutedrole"];

    if (!detCat || !message.guild.channels.get(detCat)) return message.reply("The detention category is either not set or no longer exists.");
    if (!muteRole || !message.guild.roles.get(muteRole)) return message.reply("The muted role is either not set or no longer exists");
    if (!match[1] || !message.guild.members.get(match[1])) return message.reply("Either a user was not supplied, or the user is no longer a member of the guild.");

    const muteUser = this.client.users.get(match[1]);
    const muteMember = await message.guild.members.fetch(match[1]);
    muteRole = message.guild.roles.get(muteRole);

    if (this.client.db.detention.get(`${message.guild.id}-${muteUser.id}`)) return message.reply(`${muteUser.tag} is already muted`);

    detCat = message.guild.channels.get(detCat);

    await muteMember.roles.add(muteRole);

    const muteLengthMS =
      ((60 * 60 * 24 * (match[2] ? Number(match[2]) : 0)) +
        (60 * 60 * (match[3] ? Number(match[3]) : 0)) +
        (60 * (match[4] ? Number(match[4]) : 0)) +
        (match[5] ? Number(match[5]) : 0)) * 1000;
    const muteLengthStr = `${match[2] ? `${match[2]}d` : ""}${match[3] ? `${match[3]}h` : ""}${match[4] ? `${match[4]}m` : ""}${match[5] ? `${match[5]}s` : ""}`;
    const endTime = Date.now() + muteLengthMS;

    const muteChan = await message.guild.channels.create(
      `mute-${muteUser.username.replace(/\s/, "-")}`,
      {
        parent: detCat,
        reason: `${message.author.tag} muted ${muteUser.tag}`,
        type: "text"
      }
    );

    muteChan.updateOverwrite(muteUser.id, {
      VIEW_CHANNEL: true
    });

    await muteUser.send({ embed: this.client.constants.embedTemplates.dm(message, `Muted (${muteLengthStr})`, match[6]) })
      .catch(() => message.reply('Unable to DM user.'));

    let logsChan = this.client.db.settings.get(message.guild.id, "logschannel");
    if (logsChan && message.guild.channels.get(logsChan)) {
      logsChan = message.guild.channels.get(logsChan);
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, muteUser, `Mute (${muteLengthStr})`, match[6]) });
    }

    this.client.db.tempModActions.set(`${message.guild.id}-${muteUser.id}`, { action: "mute", endTime });
    this.client.db.detention.set(`${message.guild.id}-${muteUser.id}`, muteChan.id);
    this.client.handlers.modNotes.addAction(message, muteUser, message.author, `Mute (${muteLengthStr})`, match[6]);

    return message.reply(`${muteUser.tag} has been muted.`);
  }
};