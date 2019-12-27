class AutoMod {
  constructor(client) {
    this.client = client;
  }

  addWord(message, term) {
    term = term.toLowerCase();
    return new Promise((resolve, reject) => {
      const gSettings = this.client.db.settings.get(message.guild.id);

      if (gSettings["automodlist"].indexOf(term) !== -1) return reject(`\`${term} is already on this server's automod list\``);
      gSettings["automodlist"].push(term);

      this.client.db.settings.set(message.guild.id, gSettings);

      return resolve();
    });
  }
  listWords(message) {
    return new Promise((resolve, reject) => {
      const gSettings = this.client.db.settings.get(message.guild.id);
      let toSend = `__**Automod List for ${message.guild.name}**__\`\`\`md\n`;

      if (!gSettings["automodlist"].length) return resolve(`${message.guild.name}'s automod list is empty.`);
      else {
        gSettings["automodlist"].forEach((val, index) => {
          toSend += `${index + 1}. ${val}${gSettings["automodlist"].length > index ? "\n" : ""}`;
        });
      }

      toSend += "```";
      return resolve(toSend);
    });
  }
  removeWord(message, number) {
    number = Number(number) - 1;
    return new Promise((resolve, reject) => {
      const gSettings = this.client.db.settings.get(message.guild.id);

      if (!gSettings["automodlist"].length) return reject("Automod term list is empty.");
      if (!gSettings["automodlist"][number]) return reject(`No entry was found for automod term #${number + 1}`);

      gSettings["automodlist"].splice(number, 1);
      this.client.db.settings.set(message.guild.id, gSettings);

      return resolve();
    });
  }
}

module.exports = AutoMod;