const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[WARNING] La commande ${filePath} est invalide.`);
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Ton ID bot et ID de serveur test
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

(async () => {
  try {
    console.log(`🧹 Suppression des anciennes commandes de serveur...`);
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );
    console.log(`✅ Anciennes commandes supprimées avec succès.`);

    console.log(`🚀 Déploiement des commandes globales (${commands.length})...`);
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Commandes globales déployées avec succès.');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement :', error);
  }
})();