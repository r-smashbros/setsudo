const Event = require('../structures/event.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "ready"
    });
  }

  execute(ctx = null) {
    console.log('Ready');

    this.client.user.setActivity("*sips tea*");
    this.client.gameInterval = setInterval(() => {
      this.client.user.setActivity("*sips tea*");
    }, 5 * 60 * 1000);
  }
};