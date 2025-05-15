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

function checkVictory() {
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return wins.some(([a, b, c]) =>
        board[a] && board[a] === board[b] && board[a] === board[c]
    );
}

function choisirCoupBot() {
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = '⭕';
            if (checkVictory()) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = '❌';
            if (checkVictory()) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }

    const coupsLibres = board
        .map((val, idx) => (val === null ? idx : null))
        .filter(val => val !== null);

    return coupsLibres[Math.floor(Math.random() * coupsLibres.length)];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('morpion')
        .setDescription('Lance une partie de morpion en solo contre le bot'),
    async execute(interaction) {
        if (gameActive) {
            return interaction.reply({ content: '❌ Une partie est déjà en cours.', ephemeral: true });
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