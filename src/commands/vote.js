const Command = require('../structures/command.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "vote",
      aliases: [],
      ltu: client.constants.perms.staff
    });
  }

  async execute(message) {
    await message.delete().catch(e => null);
    const toReact = (await message.channel.messages.fetch({ limit: 1 })).last();

    const num = /([1-9])/.exec(message.content);

    if (num) {
      const numEmoji = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣"];
      numEmoji.splice(num[0]);

      for (const emoji of numEmoji) { 
        await toReact.react(emoji).catch(e => console.error(e.stack));
      }
    } else {
      // TODO: Find a way to not hardcode this
      const yesEmoji = this.client.guilds.get("553311497279897601").emojis.get("556164445794074657");
      const noEmoji = this.client.guilds.get("553311497279897601").emojis.get("556164445491953679");

      await toReact.react(yesEmoji).catch(e => console.error(e.stack));
      await toReact.react(noEmoji).catch(e => message.channel.send("ERROR: I cannot react to the message."));
    }
  }
};