const Command = require('../../structures/command.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "silence",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    // addAction(message, user, mod, action, reason)
    const match = /(?:silence)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+(\d+))(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: silence <user-id/mention> <time-in-minutes> <reason>");

    const gSettings = this.client.db.settings.get(message.guild.id);
    let muteRole = gSettings['mutedrole'];
    if (!muteRole || !message.guild.roles.get(muteRole)) return message.reply('The muted role is either not set or no longer exists');
    muteRole = message.guild.roles.get(muteRole);

    const user = await this.client.users.fetch(match[1]);
    const member = await message.guild.members.fetch(match[1]);

    await member.roles.add(muteRole);
    const endTime = Date.now() + (Number(match[2]) * 60 * 1000);

    await user.send({ embed: this.client.constants.embedTemplates.dm(message, `Muted (${match[2]} minutes)`, match[3]) })
      .catch(() => message.reply('Unable to DM user.'));

    let logsChan = this.client.db.settings.get(message.guild.id, "logschannel");
    if (logsChan && message.guild.channels.get(logsChan)) {
      logsChan = message.guild.channels.get(logsChan);
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, user, `Silence (${match[2]} minutes)`, match[3]) });
    }

    this.client.db.tempModActions.set(`${message.guild.id}-${user.id}`, { action: "silence", endTime });
    this.client.handlers.modNotes.addAction(message, user, message.author, `Silence (${match[2]}m)`, match[3]);
    return message.reply(`${user.tag} silenced for ${match[2]} minutes.`);
  }
};