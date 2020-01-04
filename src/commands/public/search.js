const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "search",
      aliases: [],
      ltu: client.constants.perms.staff,
      selfhost: true
    });
  }

  /**
   * Entry point for search command
   * @param {Message} message The message that invoked the command
   * @returns {Message|null} Returns Message instance if an error occurs. Otherwise, nothing is returned.
   */
  async execute(message) {
    const match = /(?:search)(?:\s+(?:<@!?)?(\d{17,20})>?)/.exec(message.content);
    if (!match) return message.reply("Invalid Syntax: search <user-id/mention>");

    // Fetch user notes
    const user = await this.client.users.fetch(match[1]);
    const notes = await this.client.handlers.modNotes.listNotes(message, user);

    // If the notes are too long, return as a hastebin link for viewing
    if (typeof notes === "string") {
      message.channel.send(`User Notes are too long to be sent within Discord\n\n${await this.client.hastebin(notes)}`).catch(e => {
        message.reply("An error occurred. Contact the bot developer");
        console.error(e.stack);
      });
    } else {
      message.channel.send({ embed: notes }).catch(e => {
        message.reply("An error occurred. Contact the bot developer");
        console.error(e.stack);
      });
    }
  }
};