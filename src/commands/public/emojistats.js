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

  /**
   * Entry point for emojistats command
   * @param {Message} message The message that invoked the command
   */
  async execute(message) {
    // Sort emojistats DB in descending order
    const sorted = new Map([...this.client.db.emojiStats.entries()].sort((a, b) => b[1] - a[1]));
    const emojiList = message.guild.emojis.map(e => e.name);
    let msg = `\`\`\`asciidoc\n= Emoji stats for ${message.guild.name}\n`;

    // Loop over the emojis and usage counts in the enmap (previously used emojis)
    sorted.forEach((usageCount, emojiID) => {
      const emoji = message.guild.emojis.get(emojiID);
      if (!emoji) return;
      // Append the emoji name, dynamic spacer, and usage count to the message
      msg += `${emoji.name}`;
      msg += `${" ".repeat(Math.max(...(emojiList)) - emoji.name.length + 1)}:: `;
      msg += `${usageCount.toLocaleString()} usages\n`;
    });

    // Append all unused emoji
    for (const emoji of message.guild.emojis.values()) {
      if (!sorted.has(emoji.id)) msg += `${emoji.name}${" ".repeat(Math.max(...(emojiList)) - emoji.name.length + 1)}:: 0 usages\n`;
    }

    msg += `\`\`\``;

    // Send stats split across multiple messages with proper formatting
    message.channel.send(msg, { split: { prepend: "```asciidoc\n", append: "```" } });
  }
};