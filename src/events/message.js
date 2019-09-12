const Event = require('../structures/event.js');
const { Collection, MessageEmbed } = require('discord.js');
module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "message"
    });

    this.permissions = new (require('../handlers/permission.js'))();
  }

  async execute(ctx = null) {
    if (ctx.author.bot) return;
    if (ctx.channel.type !== "text") return;

    await this.autoModCheck();

    if (!ctx.content.startsWith(this.client.config['discord']['prefix'])) return;

    const content = ctx.content.slice(this.client.config['discord']['prefix'].length);

    const command = await this.fetchCommand(content.split(' ')[0]);
    if (!command) return;

    ctx.perm = this.checkPerm(ctx);
    if (command.ltu > ctx.perm[0]) return;

    return command.execute(ctx);
  }

  fetchCommand(text) {
    return new Promise((resolve, reject) => {
      if (this.client.commands.has(text)) return resolve(this.client.commands.get(text));
      this.client.commands.forEach(c => { if (c.aliases && c.aliases.includes(text)) return resolve(c); });
      return resolve();
    });
  }

  checkPerm(message) {
    return this.permissions.fetch(this.client, message);
  }

  async autoModCheck(message) { 
    const gSettings = this.client.db.settings.get(message.guild.id);
    if (gSettings['automodlist'] && gSettings['automodlist'].length) {

      for (const term of gSettings['automodlist']) {
        const checkRegex = new RegExp(`\b${term}\b`);

        if (checkRegex.test(message.content)) {
          let nearMsgs = await message.channel.messages.fetch({ limit: 5 });
          nearMsgs = new Collection([...nearMsgs].reverse());

          await message.delete();

          if (gSettings['automodchannel'] && message.guild.channels.get(gSettings['automodchannel'])) {
            const amChan = message.guild.channels.get(gSettings['automodchannel']);

            const embed = new MessageEmbed()
              .setTitle(`Potential trouble found in <#${message.channel.id}>`)
              .setColor(this.client.constants.colours.info)
              .setTimestamp();

            for (const m of nearMsgs.values()) {
              embed.addField(`${m.author.tag} (${m.author.id})`, m.content.replace(term, `__**${term}**__`), false);
            }

            amChan.send({ embed });
          }
        }
      }
    }
  }
};