const Command = require("../structures/command.js");
const util = require("util");
const MessageEmbed = require("discord.js").MessageEmbed;

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      aliases: []
    });

    this.embed = function (input, output, error = false) {
      return new MessageEmbed().setColor(error ? 0xFF0000 : 0x00FF00).addField("Input", input).addField(error ? "Error" : "Output", `\`\`\`${error ? "" : "js"}\n${output}\n\`\`\``).setFooter(`${this.client.user.username} Eval`);
    };
  }

  execute(message) {
    if (message.author.id !== this.client.config['discord']['owner']) return;

    const code = message.content.slice(message.content.search(' ') + 1);
    if (!code.length) return message.channel.send('No code input.');

    if (code.match(/token/gi)) return message.channel.send("The input requests the user token.");

    if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) {
      try {
        return message.channel.send(`\`INPUT:\`\n\`\`\`\n${code}\n\`\`\`\n\`OUTPUT:\`\n\`\`\`\n${eval(code)}\n\`\`\``);
      } catch (err) {
        return message.channel.send(`\`INPUT:\`\n\`\`\`\n${code}\n\`\`\`\n\`ERROR:\`\n\`\`\`\n${err}\n\`\`\``);
      }
    }

    try {
      const after = eval(code);

      if (after instanceof Promise) {
        after.then(a => {
          return message.channel.send("", { embed: this.embed(code, a instanceof Object ? util.inspect(a, { depth: 0 }) : a) });
        }).catch(err => {
          return message.channel.send("", { embed: this.embed(code, err, true) });
        });
      } else {
        return message.channel.send("", { embed: this.embed(code, after instanceof Object ? util.inspect(after, { depth: 0 }) : after) });
      }
    } catch (err) {
      return message.channel.send("", { embed: this.embed(code, err, true) });
    }
  }
};