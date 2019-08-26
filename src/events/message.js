const Event = require('../structures/event.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "message"
    });

    this.permissions = new (require('../handlers/permission.js'))();
  }

  async execute(ctx = null) {
    if (ctx.author.bot) return;
    if (ctx.channel.type !== "text") return;

    if (!ctx.content.startsWith(this.client.config['discord']['prefix'])) return;

    const content = ctx.content.slice(this.client.config['discord']['prefix'].length);

    const command = await this.fetchCommand(content.split(' ')[0]);
    if (!command) return;

    ctx.perm = this.checkPerm(ctx);
    if (command.ltu > ctx.perm[0]) return;

    return command.execute(ctx);
  }

  fetchCommand(text) {
    return new Promise((resolve, reject) => {
      if (this.client.commands.has(text)) return resolve(this.client.commands.get(text));
      this.client.commands.forEach(c => { if (c.aliases && c.aliases.includes(text)) return resolve(c); });
      return resolve();
    });
  }

  checkPerm(message) { 
    return this.permissions.fetch(this.client, message);
  }
};