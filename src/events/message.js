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

    await this.autoModCheck(ctx);

    // [SH] Handle stats if not self-hosted
    if (
      !this.client.config['selfhost'] &&
      ctx.guild.id === this.client.config['servSpec']['modServ'] &&
      ctx.channel.parent.id === this.client.config['servSpec']['modCat']
    ) {
      if (!this.client.db.activityStats.has(ctx.author.id))
        this.client.db.activityStats.set(ctx.author.id, {
          "actions": 0,
          "messages": 1
        });
      else this.client.db.activityStats.inc(ctx.author.id, "messages");
    }

    if (!ctx.content.startsWith(this.client.config['discord']['prefix'])) return;

    const content = ctx.content.slice(this.client.config['discord']['prefix'].length);

    const command = await this.fetchCommand(content.split(' ')[0]);
    if (!command) return;

    ctx.perm = this.checkPerm(ctx);
    if (command.ltu > ctx.perm[0]) return;

    if (!command.selfhost && this.client.config['selfhost']) return;

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

        const checkRegex = new RegExp(`\\b${term}\\b`, 'i');

        if (checkRegex.test(message.content)) {

          let nearMsgs = await message.channel.messages.fetch({ limit: 5 });
          nearMsgs = new Collection([...nearMsgs].reverse());

          await message.delete();

          if (gSettings['automodchannel'] && message.guild.channels.get(gSettings['automodchannel'])) {
            const amChan = message.guild.channels.get(gSettings['automodchannel']);

            const embed = new MessageEmbed()
              .setDescription(`**Potential trouble found in <#${message.channel.id}>**`)
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