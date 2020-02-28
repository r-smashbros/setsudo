class AntiInvite {
  constructor(client) {
    this.client = client;
  }

  /**
   * Adds a channel to a guild's anti-invite whitelist
   * @param {Message} message The original message from the command
   * @param {string} channel The channel to be whitelisted
   * @returns {Promise<string>|Promise<>} An empty resolved promise or a rejected promise with an error
   */
  addChannel(message, channel) {
    return new Promise(async (resolve, reject) => {
      const gSettings = await this.client.handlers.db.get("settings", message.guild.id);

      if (gSettings["antiinvitewhitelist"].indexOf(channel) !== -1) return reject(`\`${channel} is already on this server's anti-invite whitelist\``);
      gSettings["antiinvitewhitelist"].push(channel);

      await this.client.handlers.db.update("settings", message.guild.id, gSettings);

      return resolve();
    });
  }

  /**
   * Fetch a guild's anti-invite whitelist and return a formatted version
   * @param {Message} message The original message from the command
   * @returns {Promise<string>} A promise with the guild's anti-invite whitelist
   */
  listChannels(message) {
    return new Promise(async (resolve, reject) => {
      const gSettings = await this.client.handlers.db.get("settings", message.guild.id);
      let toSend = `__**Anti-invite whitelist for ${message.guild.name}**__\`\`\`md\n`;

      // Check if guild has whitelisted any channels
      if (!gSettings["antiinvitewhitelist"].length) return resolve(`${message.guild.name}'s anti-invite whitelist is empty.`);
      else {
        // Loop over each channel
        gSettings["antiinvitewhitelist"].forEach((val, index) => {
          // Append channel to string in a formatted form
          toSend += `${index + 1}. ${val}${gSettings["antiinvitewhitelist"].length > index ? `\n` : ""}`;
          // toSend += `${index + 1}. ${val}${gSettings["automodlist"].length > index ? "\n" : ""}`;
        });
      }

      toSend += "```";
      return resolve(toSend);
    });
  }

  /**
   * Removes a channel from a guild's anti-invite whitelist
   * @param {Message} message The original message from the command
   * @param {string} number The number of the channel to be removed
   * @returns {Promise<string>|Promise<>} An empty resolved promise or a rejected promise with an error
   */
  removeChannel(message, number) {
    // Arrays start at zero
    number = Number(number) - 1;

    return new Promise(async (resolve, reject) => {
      const gSettings = await this.client.handlers.db.get("settings", message.guild.id);
      if (!gSettings["antiinvitewhitelist"].length) return reject("Anti-invite channel list is empty.");
      if (!gSettings["antiinvitewhitelist"][number]) return reject(`No entry was found for channel ${channel}`);

      // Remove channel from whitelist
      gSettings["antiinvitewhitelist"].splice(number, 1);

      await this.client.handlers.db.update("settings", message.guild.id, gSettings);
      return resolve();
    });
  }
}

module.exports = AntiInvite;