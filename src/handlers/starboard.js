class Starboard {
  constructor(client) {
    this.client = client;
  }

  /**
   * Add starboard DB entry for guild
   * 
   * @param {Message} message The original message from the command
   * @param {string} channelID The channel ID of the starboard channel
   * @param {boolean} emojiUnicode Whether or not the emoji is from the Unicode standard
   * @param {string} emojiName The name of the emoji
   * @param {string} emojiID The ID of the emoji
   * @param {string} limit The required number of reactions
   * 
   * @returns {Promise<string>}
   */
  addSB(message, channelID, emojiUnicode, emojiName, emojiID, limit) {
    return new Promise((resolve, reject) => {
      const gSettings = this.client.db.settings.get(message.guild.id);

      if (gSettings["starboard"][channelID])
        return reject(`${channelID} already has a starboard set. Starboards are limited to one per channel. Remove it and try again.`);

      // Store starboard information in a template
      gSettings["starboard"][channelID] = { "emoji": { "unicode": emojiUnicode, "name": emojiName, "id": emojiID }, limit: Number(limit) };

      this.client.db.settings.set(message.guild.id, gSettings);

      return resolve("");
    });
  }

  /**
   * Fetch all guild starboards and return a formatted list
   * @param {Message} message The original message from the command
   * @returns {Promise<string>} A promise with the guild's starboard list
   */
  listServerSB(message) {
    return new Promise((resolve, reject) => {
      const gSettings = this.client.db.settings.get(message.guild.id);
      let toSend = `__**Starboards for ${message.guild.name}**__\`\`\`md\n`;

      // Check if guild has any starboards
      if (!Object.keys(gSettings["starboard"]).length) return resolve(`${message.guild.name} has no starboards!`);
      else {
        // Loop over each starboard
        for (const [id, data] of Object.entries(gSettings["starboard"])) {
          // Append starboard information to string
          toSend += `${id}. ${data["emoji"]["name"]}${!data["emoji"]["unicode"] ? ` (${data["emoji"]["id"]})` : ""} | Limit: ${data["limit"]}\n`;
        }
      }

      toSend += "```";
      return resolve(toSend);
    });
  }
  
  /**
   * Remove starboard DB entry for guild
   * 
   * @param {Message} message The original message from the command
   * @param {string} id The channel ID for the starboard
   * 
   * @returns {Promise<string>|Promise<>} An empty resolved promise or a rejected promise with an error
   */
  removeSB(message, id) {
    return new Promise((resolve, reject) => {
      const gSettings = this.client.db.settings.get(message.guild.id);

      if (!Object.keys(gSettings["starboard"]).length) return reject("There are no starboards.");
      if (!gSettings["starboard"][id]) return reject(`No entry was found for channel ID ${id}`);

      delete gSettings["starboard"][id];

      this.client.db.settings.set(message.guild.id, gSettings);

      return resolve();
    });
  }
}

module.exports = Starboard;