const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

// Chỉ để 1 dòng login duy nhất ở cuối file là được
client.login(process.env.TOKEN);

const inventory = {}; 

const shopItems = [
    { name: "Cần Tre", price: 0, bonus: 0.05, desc: "Cần cơ bản." },
    { name: "Cần Gỗ", price: 200, bonus: 0.1, desc: "Bền hơn chút." },
    { name: "Cần Sắt", price: 500, bonus: 0.2, desc: "Cứng cáp." },
    { name: "Cần Bạc", price: 1200, bonus: 0.35, desc: "Sáng bóng." },
    { name: "Cần Vàng", price: 3000, bonus: 0.5, desc: "Đẳng cấp đại gia." },
    { name: "Cần Kim Cương", price: 8000, bonus: 0.8, desc: "Huyền thoại." }
];

const fishData = [
    { name: "Cá Rồng", weather: "Nắng", rarity: "Hiếm", size: "60cm", price: 500, color: 0xFFD700 },
    { name: "Cá Vàng", weather: "Nắng", rarity: "Thường", size: "10cm", price: 50, color: 0xFFA500 },
    { name: "Cá Chép", weather: "Mưa", rarity: "Thường", size: "20cm", price: 60, color: 0x8B4513 },
    { name: "Cá Trê", weather: "Mưa", rarity: "Thường", size: "30cm", price: 80, color: 0x696969 },
    { name: "Cá Băng", weather: "Tuyết", rarity: "Hiếm", size: "40cm", price: 300, color: 0x00FFFF },
    { name: "Cá Tuyết", weather: "Tuyết", rarity: "Thường", size: "25cm", price: 100, color: 0xE0FFFF },
    { name: "Cá Mập", weather: "Bão", rarity: "Siêu Hiếm", size: "250cm", price: 2000, color: 0x2F4F4F },
    { name: "Cá Ngao", weather: "Bão", rarity: "Thường", size: "5cm", price: 30, color: 0xD3D3D3 },
    { name: "Cá Ma", weather: "Sương mù", rarity: "Siêu Hiếm", size: "20cm", price: 1500, color: 0x4B0082 },
    { name: "Cá Đèn", weather: "Sương mù", rarity: "Thường", size: "15cm", price: 90, color: 0xFFFF00 },
    { name: "Cá Cầu Vồng", weather: "Cầu vồng", rarity: "SECRET", size: "8cm", price: 10000, color: 0xFF00FF }
];

client.once('ready', () => {
    console.log(`✅ Bot đã kết nối thành công: ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const uid = message.author.id;
    if (!inventory[uid]) inventory[uid] = { money: 1000, rod: "Cần Tre", fishes: {} };

    if (message.content === '!cauca') {
        const rod = shopItems.find(i => i.name === inventory[uid].rod);
        if (Math.random() > (0.5 - rod.bonus)) {
            const weatherList = ["Nắng", "Mưa", "Tuyết", "Bão", "Sương mù", "Cầu vồng"];
            const weather = weatherList[Math.floor(Math.random() * weatherList.length)];
            const possibleFish = fishData.filter(f => f.weather === weather);
            const fish = possibleFish.length > 0 ? possibleFish[Math.floor(Math.random() * possibleFish.length)] : fishData[0];
            
            inventory[uid].fishes[fish.name] = (inventory[uid].fishes[fish.name] || 0) + 1;
            
            const embed = new EmbedBuilder()
                .setTitle("🎣 Kéo cần thành công!")
                .setColor(fish.color)
                .setDescription(`Bạn đã bắt được **${fish.name}** trong thời tiết ${weather}!`)
                .addFields(
                    { name: "✨ Hiếm", value: fish.rarity, inline: true },
                    { name: "📏 Size", value: fish.size, inline: true },
                    { name: "💰 Giá", value: `${fish.price} xu`, inline: true }
                );
            message.reply({ embeds: [embed] });
        } else message.reply("💨 Bạn đã vụt mất con cá... Cần câu yếu quá rồi!");
    }

    if (message.content === '!shop') {
        const embed = new EmbedBuilder().setTitle("🏪 Cửa Hàng").setDescription(shopItems.map(i => `**${i.name}** (${i.price} xu) - ${i.desc}`).join('\n'));
        message.reply({ embeds: [embed] });
    }

    if (message.content.startsWith('!buy ')) {
        const itemName = message.content.substring(5).trim();
        const item = shopItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        if (item && inventory[uid].money >= item.price) {
            inventory[uid].money -= item.price;
            inventory[uid].rod = item.name;
            message.reply(`✅ Đã mua ${item.name}!`);
        } else message.reply("❌ Không đủ tiền hoặc vật phẩm không tồn tại!");
    }

    if (message.content === '!inv') {
        const fishList = Object.entries(inventory[uid].fishes).map(([n, c]) => `${n}: x${c}`).join('\n') || "Trống";
        const embed = new EmbedBuilder().setTitle(`🎒 ${message.author.username}`).setDescription(`💰 Xu: ${inventory[uid].money}\n🎣 Cần: ${inventory[uid].rod}\n\n**Cá:**\n${fishList}`);
        message.reply({ embeds: [embed] });
    }
});