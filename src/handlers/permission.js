class PermissionLevel {

  /**
   * Fetches message author's permission level for invoking commands
   * 
   * @param {Client} client The discord.js Client instance
   * @param {Message} message The message to check
   * 
   * @returns {Array} Array of permission information
   */
  async fetch(client, message) {

    // Fallback to normal guild member
    if (!message.author || !message.member) return [client.constants.perms.user, "Guild Member"];

    if (client.config.discord.owner === message.author.id)
      return [client.constants.perms.dev, "Developer"];

    const gSettings = await client.handlers.db.get("settings", message.guild.id);

    if (gSettings['staffrole'] && message.member.roles.some(r => r.id === gSettings['staffrole']))
      return [client.constants.perms.staff, "Staff"];

    if (gSettings['helperrole'] && message.member.roles.some(r => r.id === gSettings['helperrole']))
      return [client.constants.perms.helper, "Helper"];

    // Fallback to normal guild member
    return [client.constants.perms.user, "Guild Member"];
  }
}

module.exports = PermissionLevel;
