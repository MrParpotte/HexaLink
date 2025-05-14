const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Analyse réseau de HexaLink 🖥️'),

  async execute(interaction) {
    let percent = 0;
    const totalBlocks = 10;

    const getBar = (percent) => {
      const filled = Math.floor((percent / 100) * totalBlocks);
      const empty = totalBlocks - filled;
      return `[${'█'.repeat(filled)}${' '.repeat(empty)}] ${percent}%`;
    };

    const embed = {
      color: 0x00ff00,
      title: 'Terminal > Analyse réseau',
      description: `> Initialisation...\n\`\`\`\nChargement : ${getBar(percent)}\n\`\`\``,
      footer: { text: 'HexaLink - Mode console' },
      timestamp: new Date()
    };

    const reply = await interaction.reply({ embeds: [embed] });
    // récupère la réponse (comme fetchReply)
    const message = await interaction.fetchReply();

    const interval = setInterval(async () => {
      percent += 10;

      if (percent < 100) {
        embed.description = `> En cours...\n\`\`\`\nChargement : ${getBar(percent)}\n\`\`\``;
        await interaction.editReply({ embeds: [embed] });
      } else {
        clearInterval(interval);

        const endTime = Date.now();
        const latency = endTime - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        const resultEmbed = {
          color: 0x00ff00,
          title: 'Terminal > Résultat du Ping',
          description: [
            '```txt',
            'Réseau connecté avec succès.',
            '',
            `Latence Bot     : ${latency} ms`,
            `Latence Discord : ${apiLatency} ms`,
            '',
            'Status : OK',
            '```'
          ].join('\n'),
          footer: { text: 'HexaLink - Console prête' },
          timestamp: new Date()
        };

        await interaction.editReply({ embeds: [resultEmbed] });
      }
    }, 400);
  }
};