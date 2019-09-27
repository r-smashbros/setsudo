class Command {
  constructor(client, { name, aliases, ltu, selfhost }) {
    this.client = client;
    this.name = name;
    this.aliases = aliases || new Array();

    // Level to Use
    this.ltu = ltu || client.constants.perms.user;

    // Self-host bool for disabling server-specific commands
    this.selfhost = selfhost || true;
  }
}

module.exports = Command;