const { Events, ChannelType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const config = await db.get(`captcha_${member.guild.id}`);
        if (!config) return;

        const channel = member.guild.channels.cache.get(config.channelId);
        const role = member.guild.roles.cache.get(config.roleId);
        if (!channel || !role || channel.type !== ChannelType.GuildText) return;

        const maxAttempts = 3;
        let attempts = 0;

        // Fonction pour générer un code captcha aléatoire
        function generateCode() {
            return Math.random().toString(36).substring(2, 8).toUpperCase();
        }

        while (attempts < maxAttempts) {
            const code = generateCode();

            await channel.send({
                content: `<@${member.id}> bienvenue ! Recopie ce code pour prouver que tu n'es pas un robot :\n\`\`\`${code}\`\`\`\nTu as 60 secondes pour répondre. Tentative ${attempts + 1} sur ${maxAttempts}.`
            });

            const filter = msg =>
                msg.author.id === member.id &&
                msg.content.trim().toUpperCase() === code;

            try {
                await channel.awaitMessages({
                    filter,
                    max: 1,
                    time: 60000,
                    errors: ['time']
                });

                await member.roles.add(role);
                await channel.send(`✅ <@${member.id}> a réussi le captcha et a reçu le rôle ${role.name}.`);
                return; // Sort de la boucle et fin de l'exécution
            } catch (err) {
                attempts++;
                if (attempts >= maxAttempts) {
                    await channel.send(`❌ <@${member.id}> n'a pas réussi le captcha après ${maxAttempts} tentatives.`);
                    // Optionnel : kick le membre ici si tu veux
                    // await member.kick('Échec du captcha');
                    return;
                } else {
                    await channel.send(`❌ Mauvaise réponse. Nouvelle tentative...`);
                }
            }
        }
    }
};