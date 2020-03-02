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
    const match = /(?:set(?:tings)?)(?:\s+([a-zA-Z0-9]+))?(?:\s+([\w\W]+))?/.exec(message.content);
    if (!match) {
      console.error(`ERROR IN "settings" COMMAND: RegexMal\n\n${message.content}`);
      return message.reply("An error has occurred. Contact the bot developer.");
    }

    // Fetch guild settings
    const gSettings = await this.client.handlers.db.get("settings", message.guild.id);

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
      if (match[1] === "antiinvite") return message.reply(this._setBoolean(message, gSettings, match[1], match[2]));
      if (match[1] === "automodlogschannel") return message.reply(this._setChannel(message, gSettings, match[1], match[2], false));
      if (match[1] === "detentioncategory") return message.reply(this._setChannel(message, gSettings, match[1], match[2], true));
      if (match[1] === "detentionrole") return message.reply(this._setRole(message, gSettings, match[1], match[2]));
      if (match[1] === "dynamicvccategory") return message.reply(this._setChannel(message, gSettings, match[1], match[2], true));
      if (match[1] === "dynamicvcbasevc") return message.reply(this._setChannel(message, gSettings, match[1], match[2], false));
      if (match[1] === "helperrole") return message.reply(this._setRole(message, gSettings, match[1], match[2]));
      if (match[1] === "memberlogschannel") return message.reply(this._setChannel(message, gSettings, match[1], match[2], false));
      if (match[1] === "messagelogschannel") return message.reply(this._setChannel(message, gSettings, match[1], match[2], false));
      if (match[1] === "modlogschannel") return message.reply(this._setChannel(message, gSettings, match[1], match[2], false));
      if (match[1] === "mutedrole") return message.reply(this._setRole(message, gSettings, match[1], match[2]));
      if (match[1] === "staffrole") return message.reply(this._setRole(message, gSettings, match[1], match[2]));
      if (match[1] === "vclogschannel") return message.reply(this._setChannel(message, gSettings, match[1], match[2], false));

      return message.reply(`Invalid seting provided: \`${match[1]}\`. ${this.possibleSettings}`);
    }
  }

  /**
   * Finds, verifies, and stores channel information for a setting
   * @private
   * 
   * @param {Message} message The message that invoked the command
   * @param {object} gSettings The guild's settings
   * @param {string} setting The setting to be changed
   * @param {string} value The name or ID of the channel value
   * @param {boolean} isCategory Whether or not the setting must be a category
   * 
   * @returns {string} Output to be returned to user
   */
  _setChannel(message, gSettings, setting, value, isCategory) {

    // Fetch channel based on name or ID. Return error message if none found.
    const channel = message.guild.channels.find(c => c.name === value) || message.guild.channels.get(value);
    if (!channel) return `The provided value is not a valid channel name or ID: ${value}`;

    // Ensure channel is a category if isCategory is set
    if (isCategory && channel.type !== "category") return `The provided value is not a valid category name or ID: ${value}`;

    // Update guild settings
    gSettings[setting] = channel.id;
    this.client.handlers.db.update("settings", message.guild.id, gSettings);

    return `Setting \`${setting}\` set to \`${channel.name}\``;
  }

  /**
   * Finds, verifies, and stores role information for a setting
   * @private
   * 
   * @param {Message} message The message that invoked the command
   * @param {object} gSettings The guild's settings
   * @param {string} setting The setting to be changed
   * @param {string} value The name or ID of the role value
   * 
   * @returns {string} Output to be returned to user
   */
  _setRole(message, gSettings, setting, value) {
    // Fetch role based on name or ID. Return error message if none found.
    const role = message.guild.roles.find(c => c.name === value) || message.guild.roles.get(value);
    if (!role) return `The provided value is not a valid channel name or ID: ${value}`;

    // Update guild settings
    gSettings[setting] = role.id;
    this.client.handlers.db.update("settings", message.guild.id, gSettings);

    return `Setting \`${setting}\` set to \`${role.name}\``;
  }

  /**
   * Stores boolean for a setting
   * @private
   * 
   * @param {Message} message The message that invoked the command
   * @param {object} gSettings The guild's settings
   * @param {string} setting The setting to be changed
   * @param {string} value The boolean to be stored
   * 
   * @returns {string} Output to be returned to user
   */
  _setBoolean(message, gSettings, setting, value) {
    if (value != "true" && value != "false") return `The provided value is not a boolean: ${value}`;

    // Converts the string value to a boolean for storage
    let valueAsBool = (value == 'true')

    // Update guild settings
    gSettings[setting] = valueAsBool;
    this.client.handlers.db.update("settings", message.guild.id, gSettings);

    return `Setting \`${setting}\` set to \`${valueAsBool}\``;
  }

};