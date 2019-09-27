const Command = require('../../structures/command.js');

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
    const match = /(?:mute)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+(\d+))(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: mute <user-id/mention> <time-in-minutes> <reason>");

    const gSettings = this.client.db.settings.get(message.guild.id);

    let detCat = gSettings['detentioncategory'];
    let muteRole = gSettings['mutedrole'];

    if (!detCat || !message.guild.channels.get(detCat)) return message.reply('The detention category is either not set or no longer exists.');
    if (!muteRole || !message.guild.roles.get(muteRole)) return message.reply('The muted role is either not set or no longer exists');
    // TODO: Handle if user left server before detention ended
    if (!match[1] || !message.guild.members.get(match[1])) return message.reply('Either a user was not supplied, or the user is no longer a member of the guild.');

    const muteUser = this.client.users.get(match[1]);
    const muteMember = await message.guild.members.fetch(match[1]);
    muteRole = message.guild.roles.get(muteRole);

    if (this.client.db.detention.get(`${message.guild.id}-${muteUser.id}`)) return message.reply(`${muteUser.tag} is already muted`);

    detCat = message.guild.channels.get(detCat);

    await muteMember.roles.add(muteRole);
    const endTime = Date.now() + (Number(match[2]) * 60 * 1000);

    const muteChan = await message.guild.channels.create(
      `mute-${muteUser.username.replace(/\s/, '-')}`,
      {
        parent: detCat,
        reason: `${message.author.tag} detentioned ${muteUser.tag}`
      }
    );

    muteChan.updateOverwrite(muteUser.id, {
      VIEW_CHANNEL: true
    });

    await muteUser.send({ embed: this.client.constants.embedTemplates.dm(message, `Muted (${match[2]} minutes)`, match[3]) })
      .catch(() => message.reply('Unable to DM user.'));

    let logsChan = this.client.db.settings.get(message.guild.id, "logschannel");
    if (logsChan && message.guild.channels.get(logsChan)) {
      logsChan = message.guild.channels.get(logsChan);
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, muteUser, `Mute (${match[2]} minutes)`, match[3]) });
    }

    this.client.db.tempModActions.set(`${message.guild.id}-${muteUser.id}`, { action: "mute", endTime });
    this.client.db.detention.set(`${message.guild.id}-${muteUser.id}`, muteChan.id);
    this.client.handlers.modNotes.addAction(message, muteUser, message.author, `Mute (${match[2]} minutes)`, match[3]);

    return message.reply(`${muteUser.tag} has been muted.`);
  }
};