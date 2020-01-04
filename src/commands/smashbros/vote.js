const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "vote",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: false
    });
  }

  /**
   * Entry point for vote command
   * @param {Message} message The message that invoked the command
   */
  async execute(message) {
    await message.delete().catch(() => null);

    // Fetch the message right before the command
    const toReact = (await message.channel.messages.fetch({ limit: 1 })).last();

    // Check for values 1-9 for range voting
    const num = /([1-9])/.exec(message.content);
    if (num) {
      const numEmoji = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣"];
      numEmoji.splice(num[0]);

      for (const emoji of numEmoji) {
        await toReact.react(emoji).catch(e => console.error(e.stack));
      }
    } else {
      // If range value is not found, react with "yes" and "no" emoji
      const yesEmoji = this.client.guilds.get("553311497279897601").emojis.get("556164445794074657");
      const noEmoji = this.client.guilds.get("553311497279897601").emojis.get("556164445491953679");

      await toReact.react(yesEmoji).catch(e => console.error(e.stack));
      await toReact.react(noEmoji).catch(() => message.channel.send("ERROR: I cannot react to the message."));
    }
  }
};