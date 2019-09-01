const Event = require('../structures/event.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "guildDelete"
    });
  }

  execute(ctx = null) {
    this.client.db.settings.delete(ctx.id);
  }
};