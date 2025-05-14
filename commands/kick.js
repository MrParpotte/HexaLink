const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulse un membre du serveur.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Le membre à expulser')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison de l’expulsion')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: '❌ Utilisateur introuvable dans ce serveur.', ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ content: '❌ Je ne peux pas expulser cet utilisateur.', ephemeral: true });
        }

        try {
            await member.kick(reason);
            await interaction.reply({
                content: `✅ ${user.tag} a été expulsé.\n📝 Raison : ${reason}`,
                ephemeral: false,
            });
        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de l’expulsion.',
                ephemeral: true,
            });
        }
    }
};