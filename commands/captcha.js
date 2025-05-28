const { SlashCommandBuilder } = require('discord.js');
const db = require('quick.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('captcha')
        .setDescription('Configurer le système de captcha')
        .addSubcommand(cmd =>
            cmd.setName('on')
                .setDescription('Active le captcha')
                .addChannelOption(opt => opt.setName('salon').setDescription('Salon de vérification').setRequired(true))
                .addRoleOption(opt => opt.setName('role').setDescription('Rôle à retirer une fois vérifié').setRequired(true)))
        .addSubcommand(cmd =>
            cmd.setName('off').setDescription('Désactive le captcha')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'on') {
            const channel = interaction.options.getChannel('salon');
            const role = interaction.options.getRole('role');

            db.set(`captcha_${interaction.guild.id}`, {
                enabled: true,
                channel: channel.id,
                role: role.id
            });

            await interaction.reply({ content: `✅ Captcha activé dans ${channel} avec le rôle ${role}`, ephemeral: true });
        } else if (sub === 'off') {
            db.delete(`captcha_${interaction.guild.id}`);
            await interaction.reply({ content: `❌ Captcha désactivé.`, ephemeral: true });
        }
    }
};