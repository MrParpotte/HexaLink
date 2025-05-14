const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannit un membre du serveur.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Le membre à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du bannissement')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';
        const member = interaction.guild.members.cache.get(user.id);

        // Vérifie si l'utilisateur est dans le serveur
        if (!member) {
            return interaction.reply({ content: '❌ Utilisateur introuvable dans ce serveur.', ephemeral: true });
        }

        // Empêche de bannir un modérateur/admin
        if (!member.bannable) {
            return interaction.reply({ content: '❌ Je ne peux pas bannir cet utilisateur.', ephemeral: true });
        }

        try {
            await member.ban({ reason });

            await interaction.reply({
                content: `✅ ${user.tag} a été banni.\n📝 Raison : ${reason}`,
                ephemeral: false,
            });
        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors du bannissement.',
                ephemeral: true,
            });
        }
    }
};