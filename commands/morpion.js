const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('morpion')
        .setDescription('Lancer une partie de morpion contre le bot'),
    async execute(interaction) {
        // vide car géré dans index.js
    }
};