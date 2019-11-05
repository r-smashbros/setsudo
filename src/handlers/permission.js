class PermissionLevel {

  fetch(client, message) {
    if (!message.author || !message.member) return [0, "Guild Member"];

    if (client.config.discord.owner === message.author.id)
      return [
        client.constants.perms.dev,
        "Developer"
      ];

    let gSettings = client.db.settings.get(message.guild.id);
    if (!gSettings) gSettings = client.db.settings.set(message.guild.id, client.constants.defaultSettings);

    if (gSettings['staffrole'] && message.member.roles.some(r => r.id === gSettings['staffrole']))
      return [
        client.constants.perms.staff,
        "Staff"
      ];
    
    if (gSettings['helperrole'] && message.member.roles.some(r => r.id === gSettings['helperrole']))
      return [
        client.constants.perms.helper,
        "Helper"
      ];

    return [client.constants.perms.user, "Guild Member"];
  }
}

module.exports = PermissionLevel;