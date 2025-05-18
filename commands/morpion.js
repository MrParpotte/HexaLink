const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

let board = Array(9).fill(null);
let playerTurn = '❌';
let gameActive = false;
let isSolo = false;

function creeGrilleBoutons() {
    return [
        new ActionRowBuilder().addComponents(
            ...[0, 1, 2].map(i => new ButtonBuilder()
                .setCustomId(`morpion_${i}`)
                .setLabel(board[i] ?? (i + 1).toString())
                .setStyle(ButtonStyle.Primary))
        ),
        new ActionRowBuilder().addComponents(
            ...[3, 4, 5].map(i => new ButtonBuilder()
                .setCustomId(`morpion_${i}`)
                .setLabel(board[i] ?? (i + 1).toString())
                .setStyle(ButtonStyle.Primary))
        ),
        new ActionRowBuilder().addComponents(
            ...[6, 7, 8].map(i => new ButtonBuilder()
                .setCustomId(`morpion_${i}`)
                .setLabel(board[i] ?? (i + 1).toString())
                .setStyle(ButtonStyle.Primary))
        )
    ];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('morpion')
        .setDescription('Lance une partie de morpion en solo contre le bot'),
    async execute(interaction) {
        if (gameActive) {
            return interaction.reply({
                content: "❌ Une partie est déjà en cours.",
                flags: 1 << 6
            });

        }

        board = Array(9).fill(null);
        playerTurn = '❌';
        gameActive = true;
        isSolo = true;

        await interaction.reply({
            content: `🎮 Morpion solo lancé ! C'est à ${playerTurn} de jouer.`,
            components: creeGrilleBoutons()
        });
    }
};