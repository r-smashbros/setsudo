class Command {
  constructor(client, { name, aliases, ltu }) {
    this.client = client;
    this.name = name;
    this.aliases = aliases || new Array();
    // Level to Use
    this.ltu = ltu || client.constants.perms.user;
  }
}

module.exports = Command;