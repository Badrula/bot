const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');

let queue = [];
let isPlaying = false;
let dispatcher = null;
let voiceChannel = null;
let volume = 0.5;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.content.startsWith('!play')) {
        voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Please join a voice channel first!');

        let url = message.content.split(' ')[1];

        if (!url.startsWith('http')) return message.reply('Invalid URL!');

        if (!isPlaying) {
            isPlaying = true;
            voiceChannel.join().then(connection => {
                playStream(connection, url);
            });
        } else {
            queue.push(url);
            message.reply(`Added **${url}** to the queue!`);
        }
    } else if (message.content === '!skip') {
        if (dispatcher) {
            dispatcher.end();
        }
    } else if (message.content === '!stop') {
        if (dispatcher) {
            dispatcher.end();
            queue = [];
            isPlaying = false;
        }
    } else if (message.content === '!pause') {
        if (dispatcher) {
            dispatcher.pause();
        }
    } else if (message.content === '!resume') {
        if (dispatcher) {
            dispatcher.resume();
        }
    } else if (message.content.startsWith('!volume')) {
        if (dispatcher) {
            let newVolume = parseInt(message.content.split(' ')[1]);
            if (!isNaN(newVolume) && newVolume >= 0 && newVolume <= 100) {
                volume = newVolume / 100;
                dispatcher.setVolume(volume);
                message.reply(`Volume set to ${newVolume}%`);
            } else {
                message.reply('Invalid volume!');
            }
        }
    }
});

function playStream(connection, url) {
    dispatcher = connection.play(ytdl(url, { filter: 'audioonly' }));
    dispatcher.setVolume(volume);
    dispatcher.on('finish', () => {
        if (queue.length > 0) {
            playStream(connection, queue.shift());
        } else {
            isPlaying = false;
            voiceChannel.leave();
        }
    });
}

client.login('MTA2NDIxMTM2MDg2MDM2MDcwNA.GKT3Wl.0gdthiSwgHK_0Pejj36hHNh05q5yapngy46ixc');
