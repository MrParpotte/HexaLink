const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('captcha')
        .setDescription('Configurer le système de captcha')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('on')
                .setDescription('Activer le captcha')
                .addChannelOption(opt =>
                    opt.setName('salon')
                        .setDescription('Salon où envoyer le captcha')
                        .setRequired(true))
                .addRoleOption(opt =>
                    opt.setName('role')
                        .setDescription('Rôle à attribuer après le captcha')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('off')
                .setDescription('Désactiver le captcha')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'on') {
            const salon = interaction.options.getChannel('salon');
            const role = interaction.options.getRole('role');

            await db.set(`captcha_${interaction.guild.id}`, {
                channelId: salon.id,
                roleId: role.id
            });

            await interaction.reply(`✅ Captcha activé !\nSalon : ${salon}\nRôle : ${role}`);
        }

        if (sub === 'off') {
            await db.delete(`captcha_${interaction.guild.id}`);
            await interaction.reply('❌ Système de captcha désactivé.');
        }
    }
};