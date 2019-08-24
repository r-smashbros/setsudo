class Command {
  constructor(client, { name, aliases }) {
    this.client = client;
    this.name = name;
    this.aliases = aliases || new Array();
  }
}

module.exports = Command;