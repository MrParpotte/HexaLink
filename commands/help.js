const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription("Affiche la liste des commandes disponibles"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle('📖 Aide de HexaLink')
      .setDescription('Voici la liste des commandes disponibles :')
      .addFields(
        { name: '🎉 Communauté', value: '`/blague`, `/sondage`' },
        { name: '🎮 Jeux & Mini-jeux', value: ' `/devine`, `/morpion`' },
        { name: '🧠 Utilitaire', value: '`/ping`' },
        { name: '🤖 Modération', value: '/`ban`, `/kick`' },
        { name: 'ℹ️ Infos', value: '`/help`' },
      )
      .setFooter({ text: 'Utilise les commandes dans un canal autorisé.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};