const Command = require("../../structures/command.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      aliases: [],
      ltu: client.constants.perms.user,
      selfhost: true
    });
  }

  async execute(message) {
    message.channel.send("Pinging...")
      .then(m => m.edit(`Client Ping: ${m.createdTimestamp - message.createdTimestamp} | API Ping: ${this.client.ws.ping}`));
  }
};