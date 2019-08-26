class PermissionLevel {

  fetch(client, message) {
    if (!message.author || !message.member) return [0, "Guild Member"];

    if (client.config.discord.owner === message.author.id)
      return [
        client.constants.perms.dev,
        "Developer"
      ];

    // TODO: Implement DB here
    /*
    if (message.member.roles.some(r => config['discord']['roleAuth']['admin'].includes(r.id)))
      return [
        client.constants.perms.admin,
        "Admin"
      ];

    if (message.member.roles.some(r => config['discord']['roleAuth']['mod'].includes(r.id)))
      return [
        client.constants.perms.mod,
        "Mod"
      ];
    */
    return [client.constants.perms.user, "Guild Member"];
  }
}

module.exports = PermissionLevel;