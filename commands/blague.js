const { SlashCommandBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const categories = ['global', 'dev', 'dark', 'limit', 'beauf', 'blondes'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blague')
        .setDescription('Reçoit une blague aléatoire')
        .addStringOption(option =>
            option.setName('catégorie')
                .setDescription('Choisir une catégorie de blague')
                .setRequired(false)
                .addChoices(
                    ...categories.map(cat => ({ name: cat, value: cat }))
                )
        ),

    async execute(interaction) {
        const category = interaction.options.getString('catégorie') || 'random';
        const endpoint = category === 'random'
            ? 'https://www.blagues-api.fr/api/random'
            : `https://www.blagues-api.fr/api/type/${category}/random`;

        try {
            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${process.env.BLAGUES_API_TOKEN}`
                }
            });

            if (!response.ok) {
                console.error('Réponse API non valide :', await response.text());
                throw new Error("Erreur API");
            }

            const blague = await response.json();
            await interaction.reply(`😂 **${blague.joke}**\n${blague.answer ? `👉 ${blague.answer}` : ''}`);
        } catch (error) {
            console.error("Erreur lors de la récupération :", error);
            await interaction.reply("❌ Une erreur est survenue en récupérant une blague.");
        }
    }
};