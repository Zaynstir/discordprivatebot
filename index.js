const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require('./config.json');
const prefix = config['Prefix'];

let timer;

bot.login(config['BOT_TOKEN']);

bot.once('ready', () => {
    console.log("Ready");
});

bot.on('message', msg => {
    console.log(msg.content);
    //console.log(msg.content.startsWith(prefix) ? "true" : "false");
    //console.log(msg.member);
    if (!msg.content.startsWith(prefix)) return;
    if (!msg.member) return;
    let args = msg.content.slice(prefix.length).trim().split(' ');
    let cmd = args.shift().toLowerCase();
    if (cmd == "h") {
        msg.channel.send(cmd);

        //msg.channel.send(args);
    }
    else if (cmd == "add" || cmd == "a") {
        let submitted = msg.author;
        //args.shift().toLowerCase();
        let name = args.shift().toLowerCase();
        //msg.guild.roles.cache.each(role => { console.log(role.id) });
        let roleNameFlag = msg.guild.roles.cache.find(role => role.name.toLowerCase() === name);
        let channelNameFlag = msg.guild.channels.cache.find(channel => channel.name.toLowerCase() === name);
        if (roleNameFlag === undefined && channelNameFlag === undefined) {
            /*createRole(name, msg)
                .then(function (role) {
                    console.log("2");
                    addPRRole(role, submitted, msg);
            })*/
            //let role2 = msg.guild.roles.cache.find(role3 => role3.name === "testRole");
            //console.log(role.id + " - " + role2.id);
            //msg.member.roles.add(role2);
            //console.log(msg.member.roles);



            msg.guild.roles.create({
                data: {
                    name: name,
                    color: "BLUE"
                },
                reason: 'privateroom'
            }).then(role => {
                msg.member.roles.add(role);

                const everyoneRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "@everyone");

                msg.guild.channels.create(name, {
                    type: 'voice',
                    reason: 'privateroom',
                    parent: "799508602326745118",
                    permissionOverwrites: [
                        {
                            id: role.id,
                            allow: ["CONNECT"]
                        },
                        {
                            id: everyoneRole.id,
                            deny: ["CONNECT"]
                        }
                    ]
                }).then((channel) => {
                    setTimeout(() => { setTimer(channel, name, msg) }, 10000);
                    /*setTimeout(() => {
                        let mems = channel.members;
                        console.log("test");
                        for (let [snowflake, guildMember] of mems) {
                            console.log('snowflake: ' + snowflake);
                            console.log('id: ' + guildMember.id);
                            console.log('user id: ' + guildMember.user.id);
                        }
                    }, 5000);*/
                    msg.mentions.members.each(member => {
                        member.roles.add(role);
                    })
                }).catch(console.error);

            }).catch(console.error);

            //
            /*
            let channelFlag = createRoom(name, roleFlag, msg);
            console.log(name + " - " + roleNameFlag + " - " + channelNameFlag);
            let ray = msg.mentions.users.each(e => {
                //console.log(e);
                addRole(roleFlag, submitted);
            });*/

            //console.log(ray);
        }

    }
    else if (cmd == "delete" || cmd == "d") {
        let name = args.shift().toLowerCase();
        deleteShit(name, msg)
    }

});

function setTimer(channel, name, msg) {
    setTimeout(() => {
        let mems = channel.members;
        //console.log("test");
        let i = 0;
        for (let [snowflake, guildMember] of mems) {

            i++;
            //console.log('snowflake: ' + snowflake);
            //console.log('id: ' + guildMember.id);
            //console.log('user id: ' + guildMember.user.id);
        }
        if (i > 0) {
            setTimer(channel, name, msg);
        }
        else {
            deleteShit(name, msg);
        }
    }, 10000);
}

function deleteShit(name, msg) {
    let roleNameFlag = msg.guild.roles.cache.find(role => role.name.toLowerCase() === name);
    let channelNameFlag = msg.guild.channels.cache.find(channel => channel.name.toLowerCase() === name);
    let channelID = "799380327654490114";

    //let channel = bot.guilds.get('729219573290762282').channels.cache.find(c => c.id == channelID);
    //console.log(channel);
    if (roleNameFlag !== undefined) roleNameFlag.delete();
    if (channelNameFlag !== undefined) {
        const everyoneRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "@everyone");
        //channelNameFlag.overwritePermissions(everyoneRole, { 'CONNECT': true });
        channelNameFlag.delete();
    }
}

async function createRoom(room, role, msg) {
    msg.guild.channels.create(room, {
        type: 'voice',
        reason: 'privateroom',
        parent: "798660801300660295",
        permissionOverwrites: [
            {
                id: role.id,
                allow: ["CONNECT"]
            }
        ]
    }).then((channel) => {

    }).catch(console.error);
}

async function createRole(role, msg) {
    msg.guild.roles.create({
        data: {
            name: role,
            color: "BLUE"
        },
        reason: 'privateroom'
    }).then(r => { console.log("1"); return r }).catch(console.error);
}

async function addPRRole(role, user, msg) {
    console.log("3" + role + " | " + user);
}

async function extendTime() {

}