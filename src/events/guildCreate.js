const Event = require("../structures/event.js");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "guildCreate"
    });
  }

  execute(ctx = null) {
    if (!ctx.available) return;
    this.client.db.settings.set(ctx.id, this.client.constants.defaultSettings);
  }
};