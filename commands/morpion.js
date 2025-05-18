client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Erreur lors de l\'exécution de la commande.', ephemeral: true });
        }
    }

    if (interaction.isButton()) {
        const index = parseInt(interaction.customId.split('_')[1]);
        if (!gameActive || board[index] !== null) {
            return interaction.reply({ content: "❌ Case invalide.", ephemeral: true });
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
                await interaction.editReply({
                    content: `⭕ (bot) a gagné !`,
                    components: creeGrilleBoutons()
                });
                return;
            } else if (board.every(cell => cell !== null)) {
                gameActive = false;
                await interaction.editReply({
                    content: `🤝 Match nul !`,
                    components: creeGrilleBoutons()
                });
                return;
            }

            playerTurn = '❌';
        }

        await interaction.update({
            content: `C'est à ${playerTurn} de jouer.`,
            components: creeGrilleBoutons()
        });
    }
});