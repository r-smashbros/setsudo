class Starboard {
  constructor(client) {
    this.client = client;
  }

  addSB(message, channelID, emojiUnicode, emojiName, emojiID, limit) {
    return new Promise((resolve, reject) => {
      const gSettings = this.client.db.settings.get(message.guild.id);

      if (gSettings['starboard'][channelID])
        return reject(`${channelID} already has a starboard set. Starboards are limited to one per channel. Remove it and try again.`);

      gSettings['starboard'][channelID] = { "emoji": { "unicode": emojiUnicode, "name": emojiName, "id": emojiID }, limit: Number(limit) };

      this.client.db.settings.set(message.guild.id, gSettings);

      return resolve();
    });
  }
  listServerSB(message) {
    return new Promise((resolve, reject) => {
      const gSettings = this.client.db.settings.get(message.guild.id);
      let toSend = `__**Starboards for ${message.guild.name}**__\`\`\`md\n`;

      if (!Object.keys(gSettings['starboard']).length) return resolve(`${message.guild.name} has no starboards!`);
      else {
        for (const [id, data] of Object.entries(gSettings['starboard'])) {
          toSend += `${id}. ${data["emoji"]["name"]}${!data['emoji']['unicode'] ? ` (${data["emoji"]["id"]})` : ""} | Limit: ${data["limit"]}\n`;
        }
      }

      toSend += "```";
      return resolve(toSend);
    });
  }
  removeSB(message, id) {
    return new Promise((resolve, reject) => {
      const gSettings = this.client.db.settings.get(message.guild.id);

      if (!Object.keys(gSettings['starboard']).length) return reject("There are no starboards.");
      if (!gSettings['starboard'][id]) return reject(`No entry was found for channel ID ${id}`);

      delete gSettings['starboard'][id];
      
      this.client.db.settings.set(message.guild.id, gSettings);

      return resolve();
    });
  }
}

module.exports = Starboard;