const { version } = require('../../package.json');

const BOT_VERSION = version;

function setStandardFooter(embed, client, extraText) {
    return embed
        .setFooter({
            text: `Jonalandia v${version}${extraText ? ` | ${extraText}` : ''}`,
            iconURL: client?.user?.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();
}

module.exports = { setStandardFooter, BOT_VERSION };
