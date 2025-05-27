const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('quick.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('captcha')
        .setDescription('Activer ou désactiver le système de captcha')
        .addSubcommand(sub =>
            sub.setName('on')
                .setDescription('Active le système de captcha')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Canal où envoyer le captcha')
                        .setRequired(true))
                .addRoleOption(opt =>
                    opt.setName('role')
                        .setDescription('Rôle à attribuer après vérification')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('off')
                .setDescription('Désactive le système de captcha')),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Tu dois être administrateur pour faire ça.', ephemeral: true });
        }

        if (sub === 'on') {
            const channel = interaction.options.getChannel('channel');
            const role = interaction.options.getRole('role');

            db.set(`captcha_${interaction.guild.id}`, {
                enabled: true,
                channel: channel.id,
                role: role.id,
            });

            return interaction.reply(`✅ Captcha activé dans ${channel} avec le rôle ${role}.`);
        }

        if (sub === 'off') {
            db.delete(`captcha_${interaction.guild.id}`);
            return interaction.reply('🚫 Le système de captcha est maintenant désactivé.');
        }
    }
};