require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActivityType,
    Collection
} = require('discord.js');

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

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Erreur lors de l\'exécution de la commande.', ephemeral: true });
    }
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    if (content.startsWith('?dé')) {
        const args = content.split(' ');
        let faces = parseInt(args[1]) || 6;
        if (faces < 1) faces = 6;

        const resultat = Math.floor(Math.random() * faces) + 1;
        message.channel.send(`🎲 Tu as lancé un dé à ${faces} faces : **${resultat}**`);
    }

    if (content.startsWith('?duel')) {
        const opponent = message.mentions.users.first();
        if (!opponent || opponent.id === message.author.id) {
            return message.channel.send("❗ Mentionne un adversaire valide pour le duel : `?duel @pseudo`");
        }

        const gagnant = Math.random() < 0.5 ? message.author : opponent;
        message.channel.send(`⚔️ ${message.author} défie ${opponent}... et le gagnant est **${gagnant}** !`);
    }

    if (message.content.startsWith('?8ball')) {
        const question = message.content.slice(6).trim();

        if (!question) {
            return message.reply("Tu dois poser une question pour que je puisse y répondre !");
        }

        const réponses = [
            "Oui, clairement.",
            "Non, sûrement pas.",
            "Peut-être bien que oui, peut-être bien que non...",
            "Je ne pense pas.",
            "C’est certain.",
            "Demande plus tard.",
            "J’ai des doutes.",
            "Absolument !",
            "Nope.",
            "Tu connais déjà la réponse."
        ];

        const aléatoire = réponses[Math.floor(Math.random() * réponses.length)];
        return message.reply(`🎱 ${aléatoire}`);
    }
});

setInterval(() => console.log(`✅ ${client.user.tag} REDEMARRAGE...`), 60_000);

client.login(process.env.DISCORD_TOKEN);

process.stdin.resume();