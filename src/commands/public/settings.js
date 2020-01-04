const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "settings",
      aliases: ["set"],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
    this.possibleSettings = `Possible settings:\n${Object.keys(this.client.constants.defaultSettings).map(set => `\`${set}\``).join(" | ")}`;
  }

  /**
   * Entry point for settings command
   * @param {Message} message The message that invoked the command
   * @returns {Message} The response to the command
   */
  async execute(message) {
    const match = /(?:set(?:tings)?)(?:\s+([a-zA-Z0-9]+))?(?:\s+([a-zA-Z0-9]+))?/.exec(message.content);
    if (!match) {
      console.error(`ERROR IN "settings" COMMAND: RegexMal\n\n${message.content}`);
      return message.reply("An error has occurred. Contact the bot developer.");
    }

    // Fetch guild settings
    const gSettings = this.client.db.settings.get(message.guild.id);

    // If no setting is provided, list possible options
    if (!match[1]) return message.reply(`No setting provided. ${this.possibleSettings}`);

    // If setting is provided but no value is given, return currently set value
    if (match[1] && !match[2]) {
      if (!Object.prototype.hasOwnProperty.call(gSettings, match[1])) return message.reply(`Invalid seting provided: \`${match[1]}\`. ${this.possibleSettings}`);
      return message.reply(`\`${match[1].toLowerCase()}\` is ${!gSettings[match[1]] ? "not set" : `set to ${gSettings[match[1]]}`}`);
    }

    // If both a setting and value is provided
    if (match[1] && match[2]) {
      match[1] = match[1].toLowerCase();

      // Check if the provided setting matches existing settings and validate provided value before updating setting
      /* eslint-disable indent */
      switch (match[1]) {
        case ("automodchannel"):
          if (message.guild.channels.get(match[2]) && message.guild.channels.get(match[2]).type === "text") {
            gSettings["automodchannel"] = match[2];
            this.client.db.settings.set(message.guild.id, gSettings);
            return message.reply(`Setting \`${match[1]}\` set to \`${match[2]}\``);
          } else return message.reply(`The provided value is not a valid channel ID: ${match[2]}`);
        case ("detentioncategory"):
          if (message.guild.channels.get(match[2]) && message.guild.channels.get(match[2]).type === "category") {
            gSettings["detentioncategory"] = match[2];
            this.client.db.settings.set(message.guild.id, gSettings);
            return message.reply(`Setting \`${match[1]}\` set to \`${match[2]}\``);
          } else return message.reply(`The provided value is not a valid category ID: ${match[2]}`);
        case ("detentionrole"):
          if (message.guild.roles.get(match[2])) {
            gSettings["detentionrole"] = match[2];
            this.client.db.settings.set(message.guild.id, gSettings);
            return message.reply(`Setting \`${match[1]}\` set to \`${match[2]}\``);
          } else return message.reply(`The provided value is not a valid role ID: ${match[2]}`);
        case ("helperrole"):
          if (message.guild.roles.get(match[2])) {
            gSettings["helperrole"] = match[2];
            this.client.db.settings.set(message.guild.id, gSettings);
            return message.reply(`Setting \`${match[1]}\` set to \`${match[2]}\``);
          } else return message.reply(`The provided value is not a valid role ID: ${match[2]}`);
        case ("logschannel"):
          if (message.guild.channels.get(match[2]) && message.guild.channels.get(match[2]).type === "text") {
            gSettings["logschannel"] = match[2];
            this.client.db.settings.set(message.guild.id, gSettings);
            return message.reply(`Setting \`${match[1]}\` set to \`${match[2]}\``);
          } else return message.reply(`The provided value is not a valid channel ID: ${match[2]}`);
        case ("mutedrole"):
          if (message.guild.roles.get(match[2])) {
            gSettings["mutedrole"] = match[2];
            this.client.db.settings.set(message.guild.id, gSettings);
            return message.reply(`Setting \`${match[1]}\` set to \`${match[2]}\``);
          } else return message.reply(`The provided value is not a valid role ID: ${match[2]}`);
        case ("staffrole"):
          if (message.guild.roles.get(match[2])) {
            gSettings["staffrole"] = match[2];
            this.client.db.settings.set(message.guild.id, gSettings);
            return message.reply(`Setting \`${match[1]}\` set to \`${match[2]}\``);
          } else return message.reply(`The provided value is not a valid role ID: ${match[2]}`);
        default:
          message.channel.reply(`Invalid seting provided: \`${match[1]}\`. ${this.possibleSettings}`);
          break;
      }
    }
  }
};