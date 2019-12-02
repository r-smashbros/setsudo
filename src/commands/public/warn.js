const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "warn",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    // addAction(message, user, mod, action, reason)
    const match = /(?:warn)\s+(?:(?:<@!?)?(\d{17,20})>?)(?:\s+([\w\W]+))/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: warn <user-id/mention> <msg>");

    const user = await this.client.users.fetch(match[1]);

    await user.send({ embed: this.client.constants.embedTemplates.dm(message, `Warned`, match[2]) })
      .catch(() => message.reply("Unable to DM user."));

    let logsChan = this.client.db.settings.get(message.guild.id, "logschannel");
    if (logsChan && message.guild.channels.get(logsChan)) {
      logsChan = message.guild.channels.get(logsChan);
      logsChan.send({ embed: this.client.constants.embedTemplates.logs(message, user, `Warn`, match[2]) });
    }

    this.client.handlers.modNotes.addAction(message, user, message.author, "Warn", match[2]);
    return message.reply(`${user.tag} warned.`);
  }
};