const Command = require('../structures/command.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "settingssync",
      aliases: ["setsync"],
      ltu: client.constants.perms.dev
    });
  }

  async execute(message) {
    await this.client.db.settings.forEach(async (gSet, gID, map) => {
      for (const defVal of this.client.constants.defaultSettings.keys()) {
        if (!gSet.hasOwnProperty(defVal)) {
          message.channel.send(`${gID} does not have setting ${defVal}. Setting...`);
          gSet[defVal] = this.client.constants.defaultSettings[defVal];
        }
      }
      await message.channel.send(`${gID} settings synced.`);
    });
    await message.channel.send("All guilds synced.");
  }
};