const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dé')
        .setDescription('Lance un dé avec le nombre de faces de ton choix')
        .addIntegerOption(option =>
            option.setName('faces')
                .setDescription('Nombre de faces du dé (ex: 6, 20, etc.)')
                .setRequired(false)
        ),

    async execute(interaction) {
        let faces = interaction.options.getInteger('faces') || 6;
        if (faces < 1) faces = 6;

        const resultat = Math.floor(Math.random() * faces) + 1;
        await interaction.reply(`🎲 Tu as lancé un dé à ${faces} faces : **${resultat}**`);
    }
};