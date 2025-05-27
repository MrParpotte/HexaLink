require('dotenv').config();

const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ActivityType, Events, Collection } = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

const statuses = [
    { name: 'en ligne et prêt à fonctionner.', type: ActivityType.Playing },
    { name: 'aider les utilisateurs est ma mission.', type: ActivityType.Playing },
    { name: '/help pour commencer', type: ActivityType.Playing },
    { name: 'connecté, toujours disponible pour aider.', type: ActivityType.Playing },
    { name: 'sécurisation en cours... Je garde tout sous contrôle.', type: ActivityType.Watching },
];

client.once('ready', async () => {

    console.log(`✅ ${client.user.tag} est prêt et en ligne !`);

    const updateStatus = () => {
        const random = statuses[Math.floor(Math.random() * statuses.length)];
        client.user.setPresence({
            activities: [random],
            status: 'online'
        });
    };

    updateStatus();
    setInterval(updateStatus, 15 * 1000);
});

function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

client.on('guildMemberAdd', async member => {
    const config = db.get(`captcha_${member.guild.id}`);
    if (!config || !config.enabled) return;

    const channel = member.guild.channels.cache.get(config.channel);
    if (!channel) return;

    const captcha = generateCaptcha();
    db.set(`captcha_code_${member.id}`, captcha);

    const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle('🔐 Vérification CAPTCHA')
        .setDescription(`Bienvenue ${member}! Merci de prouver que tu n'es pas un robot.\n\n**Recopie ce code dans ce salon :**\n\`${captcha}\``)
        .setFooter({ text: 'Tu as 2 minutes pour répondre.' });

    channel.send({ content: `<@${member.id}>`, embeds: [embed] });

    const filter = m => m.author.id === member.id;
    const collector = channel.createMessageCollector({ filter, time: 120000 });

    collector.on('collect', async msg => {
        if (msg.content === captcha) {
            const role = member.guild.roles.cache.get(config.role);
            if (role) await member.roles.remove(role).catch(() => null);
            channel.send(`✅ Bienvenue ${member}, tu es maintenant vérifié.`);
            db.delete(`captcha_code_${member.id}`);
            collector.stop('réussi');
        } else {
            msg.reply('❌ Mauvais code, essaie encore.');
        }
    });

    collector.on('end', (_, reason) => {
        if (reason !== 'réussi') {
            db.delete(`captcha_code_${member.id}`);
            channel.send(`<@${member.id}> temps écoulé. Rejoins à nouveau pour réessayer.`);
        }
    });
});

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

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// Gestion des interactions
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            if (interaction.commandName === 'morpion') {
                // reset jeu
                board = Array(9).fill(null);
                playerTurn = '❌';
                gameActive = true;
                isSolo = true;

                await interaction.reply({
                    content: `🎮 Morpion solo lancé ! C'est à ${playerTurn} de jouer.`,
                    components: creeGrilleBoutons()
                });
            } else {
                await command.execute(interaction);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Erreur.', ephemeral: true });
        }
    }

    if (interaction.isButton()) {
        const index = parseInt(interaction.customId.split('_')[1]);

        if (!gameActive || board[index] !== null) {
            return interaction.deferUpdate();
        }

        board[index] = playerTurn;

        if (checkVictory()) {
            gameActive = false;
            return interaction.update({
                content: `🎉 ${playerTurn} a gagné !`,
                components: []
            });
        }

        if (board.every(cell => cell !== null)) {
            gameActive = false;
            return interaction.update({
                content: "🤝 Match nul !",
                components: []
            });
        }

        playerTurn = playerTurn === '❌' ? '⭕' : '❌';

        if (isSolo && playerTurn === '⭕') {
            const botMove = choisirCoupBot();
            board[botMove] = '⭕';

            if (checkVictory()) {
                gameActive = false;
                return interaction.update({
                    content: `⭕ HexaLink a gagné !`,
                    components: creeGrilleBoutons()
                });
            }

            if (board.every(cell => cell !== null)) {
                gameActive = false;
                return interaction.update({
                    content: "🤝 Match nul !",
                    components: []
                });
            }

            playerTurn = '❌';
        }

        await interaction.update({
            content: `C'est à ${playerTurn} de jouer.`,
            components: creeGrilleBoutons()
        });
    }
});

setInterval(() => console.log(`✅ ${client.user.tag} REDEMARRAGE...`), 60_000);

client.login(process.env.DISCORD_TOKEN);

process.stdin.resume();