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

      for (const gVal of Object.keys(gSet)) {
        // If the default settings don't have a guild setting, delete it
        if (!Object.keys(this.client.constants.defaultSettings).includes(gVal)) {
          message.channel.send(`${gID} has an extra setting: ${gVal}. Deleting...`);
          delete gSet[gVal];
          continue;
        }

        // If the type of the default setting has changed, update the guild setting
        if (
          typeof gSet[gVal] !== typeof this.client.constants.defaultSettings[gVal] ||
          (!gSet[gVal] && this.client.constants.defaultSettings[gVal]) ||
          (gSet[gVal] && !this.client.constants.defaultSettings[gVal])
        ) {
          message.channel.send(`${gID} has a different type for setting ${gVal}. Updating...`);
          gSet[gVal] = this.client.constants.defaultSettings[gVal];
        }
      }

      for (const defVal of Object.keys(this.client.constants.defaultSettings)) {
        // If the guild settings are missing a default setting, add it
        if (!Object.prototype.hasOwnProperty.call(gSet, defVal)) {
          message.channel.send(`${gID} does not have setting ${defVal}. Setting...`);
          gSet[defVal] = this.client.constants.defaultSettings[defVal];
        }
      }

      // Sync changes to DB and send confirmation
      this.client.db.settings.set(gID, gSet);
      await message.channel.send(`${gID} settings synced.`);
    });

    await message.channel.send("All guilds synced.");
  }
};