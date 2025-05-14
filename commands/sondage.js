const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sondage')
        .setDescription('Crée un sondage avec ✅ et ❌')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('La question du sondage')
                .setRequired(true)
        ),

    async execute(interaction) {
        const question = interaction.options.getString('question');

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📊 Sondage')
            .setDescription(`${question}`)
            .setFooter({ text: 'Répondez avec ✅ pour Oui, ❌ pour Non' })
            .setTimestamp();

        // Envoie du sondage
        await interaction.reply({ embeds: [embed] });
        const message = await interaction.fetchReply();

        try {
            await message.react('✅');
            await message.react('❌');
        } catch (error) {
            console.error('Erreur lors de l’ajout des réactions :', error);
            await interaction.followUp({ content: '❌ Une erreur est survenue lors de l’ajout des réactions.', ephemeral: true });
        }

    }
};