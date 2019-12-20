const Command = require("../../structures/command.js");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "emojistats",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  async execute(message) {
    const sorted = new Map([...this.client.db.emojiStats.entries()].sort((a, b) => b[1] - a[1]));
    let emojiStats = `__**Emoji Stats for ${message.guild.name}**__\n`;
    sorted.forEach((usageCount, emojiID) => {
      const emojiName = message.guild.emojis.get(emojiID).name;
      emojiStats += `<:${emojiName}:${emojiID}> \`${emojiName}: ${usageCount.toLocaleString()} usages\` \n`;
    });
    message.channel.send(emojiStats, { split: true });
  }
};