class AutoMod {
  constructor(client) {
    this.client = client;
  }

  /**
   * Adds a term to a guild's automod list
   * 
   * @param {Message} message The original message from the command
   * @param {string} term The term to be automodded
   * 
   * @returns {Promise<string>|Promise<>} An empty resolved promise or a rejected promise with an error
   */
  addWord(message, term) {
    term = term.toLowerCase();
    return new Promise(async (resolve, reject) => {
      const gSettings = await this.client.handlers.db.get("settings", message.guild.id);

      if (gSettings["automodlist"].indexOf(term) !== -1) return reject(`\`${term} is already on this server's automod list\``);
      gSettings["automodlist"].push(term);

      await this.client.handlers.db.update("settings", message.guild.id, gSettings);

      return resolve();
    });
  }

  /**
   * Fetch a guild's automod list and return a formatted version
   * @param {Message} message The original message from the command
   * @returns {Promise<string>} A promise with the guild's automod list
   */
  listWords(message) {
    return new Promise(async (resolve, reject) => {
      const gSettings = await this.client.handlers.db.get("settings", message.guild.id);
      let toSend = `__**Automod List for ${message.guild.name}**__\`\`\`md\n`;

      // Check if guild has automodded any terms
      if (!gSettings["automodlist"].length) return resolve(`${message.guild.name}'s automod list is empty.`);
      else {
        // Loop over each term
        gSettings["automodlist"].forEach((val, index) => {
          // Append term to string in a formatted form
          toSend += `${index + 1}. ${val}${gSettings["automodlist"].length > index ? "\n" : ""}`;
        });
      }

      toSend += "```";
      return resolve(toSend);
    });
  }

  /**
   * Removes a term from a guild's automod list
   * 
   * @param {Message} message The original message from the command
   * @param {string} number The number of the term to be removed
   * 
   * @returns {Promise<string>|Promise<>} An empty resolved promise or a rejected promise with an error
   */
  removeWord(message, number) {

    // Arrays start at zero
    number = Number(number) - 1;

    return new Promise(async (resolve, reject) => {
      const gSettings = await this.client.handlers.db.get("settings", message.guild.id);

      if (!gSettings["automodlist"].length) return reject("Automod term list is empty.");
      if (!gSettings["automodlist"][number]) return reject(`No entry was found for automod term #${number + 1}`);

      // Remove term from automod list
      gSettings["automodlist"].splice(number, 1);

      await this.client.handlers.db.update("settings", message.guild.id, gSettings);
      return resolve();
    });
  }
}

module.exports = AutoMod;