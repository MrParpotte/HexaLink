const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devine')
        .setDescription('Devine un nombre entre 1 et 100 !'),

    async execute(interaction) {
        const nombreMystere = Math.floor(Math.random() * 100) + 1;
        let tentatives = 0;

        await interaction.reply("🤔 J’ai choisi un nombre entre **1 et 100**. Devine-le ! Tu as 60 secondes ⏳");

        const filter = msg => {
            return msg.author.id === interaction.user.id && !msg.author.bot;
        };

        const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

        collector.on('collect', msg => {
            const guess = parseInt(msg.content, 10);

            if (isNaN(guess)) {
                msg.reply("❌ Merci d’envoyer un **nombre** !");
                return;
            }

            tentatives++;

            if (guess === nombreMystere) {
                msg.reply(`🎉 Bravo ! Tu as trouvé le nombre **${nombreMystere}** en **${tentatives}** tentative(s) !`);
                collector.stop('trouvé');
            } else if (guess < nombreMystere) {
                msg.reply("🔺 C’est plus !");
            } else {
                msg.reply("🔻 C’est moins !");
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'trouvé') {
                interaction.channel.send(`⌛ Temps écoulé ! Le nombre était **${nombreMystere}**.`);
            }
        });
    }
};