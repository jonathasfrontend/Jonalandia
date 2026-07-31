const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const { setStandardFooter } = require("../utils/embedFooter");

function embedManutencao() {
    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle('🔧 Em manutenção')
        .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription('Canal em manutenção!')
        .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
        .setImage('https://enfoquevisual.com.br/cdn/shop/products/104-022.jpg?v=1571921877');
    return setStandardFooter(embed, client, `Por: ${client.user.tag}`);
}

module.exports = { embedManutencao };