// commands/captchaOn.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('quick.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('captcha')
        .setDescription('Configuration du système captcha')
        .addSubcommand(sub =>
            sub.setName('on')
                .setDescription('Activer le captcha')
                .addChannelOption(opt =>
                    opt.setName('salon')
                        .setDescription('Salon où envoyer le captcha')
                        .setRequired(true))
                .addRoleOption(opt =>
                    opt.setName('role')
                        .setDescription('Rôle à donner si le captcha est réussi')
                        .setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('off')
                .setDescription('Désactiver le captcha')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'on') {
            const salon = interaction.options.getChannel('salon');
            const role = interaction.options.getRole('role');

            db.set(`captcha_${interaction.guild.id}`, {
                channelId: salon.id,
                roleId: role.id
            });

            await interaction.reply(`✅ Captcha activé ! Salon : ${salon}, Rôle : ${role}`);
        }

        if (sub === 'off') {
            db.delete(`captcha_${interaction.guild.id}`);
            await interaction.reply(`❌ Système de captcha désactivé.`);
        }
    }
};