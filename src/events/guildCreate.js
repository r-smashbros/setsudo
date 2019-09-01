const Event = require('../structures/event.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "guildCreate"
    });
  }

  execute(ctx = null) {
    this.client.db.settings.set(ctx.id, this.client.constants.defaultSettings);
  }
};