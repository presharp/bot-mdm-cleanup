require('dotenv').config();

const Discord = require('discord.js');

const bot = new Discord.Client();
const TOKEN = "";

bot.login(TOKEN);

bot.on('ready', async() => {
    console.info(`Logged in as ${bot.user.tag}!`);
		
	let mdmUserIds = [];
	var lineReader = require('readline').createInterface({
		input: require('fs').createReadStream('users.txt')
	});

	lineReader.on('line', function (line) {
		mdmUserIds.push(line);
	});

	let checked = 0;
	let deleted = 0;

	lineReader.on('close', async function() {
		await mdmUserIds.forEach( async(userId)	=> {
			const member = new Discord.User(bot, { 'id': userId }); // hacky yet faster way of deleting messages (to get by discords api limit)
			if (member != undefined)
			{
				await member.createDM().then(async(dm) => 
				{
					let messages = await dm.messages.fetch(100);
					await messages.filter(m => m.author.id === bot.user.id).forEach(msg => {
						msg.delete().then( id => {
							dm.messages.cache.delete(msg.id);
							console.log("A message was deleted.");
							deleted++;
							console.log(`Deleted #${deleted}`);
						} );
					});
					checked++;
					console.log(`${checked}`);
					if (checked == mdmUserIds.length) {
						console.log(`Done. Pruned ${deleted} messages from a total of ${checked} people.`);
					}
				}).catch( err => { });
			}
		});
	});
	
});
