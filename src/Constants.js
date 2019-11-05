const { MessageEmbed } = require('discord.js');

module.exports = {
  "perms": {
    // To Protect Eval
    "dev": 10,
    "staff": 9,
    "helper": 8,
    "user": 1,
    "blacklist": 0
  },
  "colours": {
    "info": "0x00FFF9",
    "error": "0xFF0000",
    "warn": "0xFF8800",
    "success": "0x00FF00"
  },
  "defaultSettings": {
    // Role ID
    "staffrole": null,
    // Category ID
    "detentioncategory": null,
    // Channel ID
    "logschannel": null,
    // Role ID
    "mutedrole": null,
    // Role ID
    "detentionrole": null,
    // Array of strings
    "automodlist": [],
    // Channel ID
    "automodchannel": null,
    // Role ID
    "helperrole": null
  },
  "defaultNotes": {
    "actions": [],
    "notes": []
  },
  "banAppealURL": "https://docs.google.com/forms/d/1t9lQxW-E-CAtDPBRqj2yMvqO0cSe_4bPlGvxrmvtWyA/viewform",
  "embedTemplates": {
    "dm": (message, action, reason) => { 
      return new MessageEmbed()
        .setAuthor(action, message.guild.iconURL(), "https://google.com")
        .addField("» Moderator", `${message.author.tag} (${message.author.id})`, false)
        .addField("» Reason", reason, false)
        .setTimestamp()
        .setColor(0x00FFF9);
    },
    "logs": (message, user, action, reason) => { 
      const embed = new MessageEmbed()
        .setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL(), "https://google.com")
        .addField("» Action", action, false)
        .addField("» Moderator", `${message.author.tag} (${message.author.id})`, false)
        .addField("» Reason", reason, false)
        .setTimestamp();
      
      if (/(?:temp)?ban/i.test(action)) return embed.setColor(0xFF0000);
      if (/kick/i.test(action)) return embed.setColor(0xFFA500);
      if (/mute|detention|silence/i.test(action)) return embed.setColor(0xFFFF00);
      if (/warn/i.test(action)) return embed.setColor(0x00FF00);
      return embed.setColor(0x00FFF9);
    }
  }
};