const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "settingssync",
      aliases: ["setsync"],
      ltu: client.constants.perms.dev,
      selfhost: true
    });
  }

  /**
   * Entry point for settingssync command
   * @param {Message} message The message that invoked the command
   */
  async execute(message) {
    await this.client.db.settings.forEach(async (gSet, gID, map) => {
      for (const defVal of Object.keys(this.client.constants.defaultSettings)) {
        if (!Object.prototype.hasOwnProperty.call(gSet, defVal)) {
          message.channel.send(`${gID} does not have setting ${defVal}. Setting...`);
          gSet[defVal] = this.client.constants.defaultSettings[defVal];
          this.client.db.settings.set(gID, gSet);
        }
      }
      await message.channel.send(`${gID} settings synced.`);
    });
    await message.channel.send("All guilds synced.");
  }
};