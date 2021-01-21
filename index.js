const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require('./config.json');
const prefix = config['Prefix'];

let timer;
let PCCategoryID = "799508602326745118";
let overrideID = "125760087221338114";
let rooms = {};

bot.login(config['BOT_TOKEN']);

bot.once('ready', () => {
    console.log("Ready");

});

bot.on('message', msg => {
    //console.log("New Stuff");
    console.log(msg.content);
    //console.log(msg.content.startsWith(prefix) ? "true" : "false");
    //console.log(msg.member);
    if (!msg.content.startsWith(prefix)) return;
    if (!msg.member) return;
    let args = msg.content.slice(prefix.length).trim().split(' ');
    let cmd = args.shift().toLowerCase();
    if (cmd == "help" || cmd == "-h") {
        //msg.channel.send(cmd);
        let str = "Hello, I create private rooms so that people do their own thing if they want.\n";
        str += "\nCommand List\n-------------------------\n";
        str += "Prefix: !pr\n";
        /*str += "add [name] [@username] ..... Ex: !pr add test @user1 @user2\n";
        str += "delete [name] .... Ex: !pr delete test\n";
        str += "addrole [@username] .... Ex: !pr addrole @user1 @user2\n";
        str += "removerole [@username] .... Ex: !pr removerole @user1 @user2\n";*/


        str += "\'add\', \'-a\' -- add a private room and role .... SYNTAX: !pr add [name] [@user1] [@user2]\n";
        str += "\'delete\',\'-d\' -- delete a private room and role .... SYNTAX: !pr delete [name]\n";
        str += "\'addrole\', \'-ar\' -- add a role to a user .... SYNTAX: !pr addrole [name] [@user1] [@user2]\n";
        str += "\'removerole\', \'-rr\' -- remove a role from a user .... SYNTAX: !pr removerole [name] [@user1] [@user2]\n";
        str += "\'kick\', \'-k\' -- kick a user from a voice channel .... SYNTAX: !pr kick [@user1] [@user2]\n";


        msg.channel.send(str);
        //msg.channel.send(args);
    }
    else if (cmd == "add" || cmd == "-a") {
        let submitted = msg.author;
        //args.shift().toLowerCase();
        let name = args.shift().toLowerCase();
        console.log("User [" + submitted.username + "] is attempting to create PR with a name of [" + name + "]");
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

                //rooms[msg.author].push(role);
                if (Array.isArray(rooms[msg.author.id])) {
                    rooms[msg.author.id].push(role.id);
                }
                else {
                    rooms[msg.author.id] = [];
                    rooms[msg.author.id].push(role.id);
                }
                console.log(rooms);
                const everyoneRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "@everyone");

                msg.guild.channels.create(name, {
                    type: 'voice',
                    reason: 'privateroom',
                    parent: PCCategoryID,
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
                    console.log("PR channel and role [" + name + "] has been created");
                    setTimeout(() => { setTimer(channel, name, msg) }, 10000);
                    //console.log(channel.parent);
                    //console.log(channel.parentID);
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
                        //console.log(member.username);
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
        else {
            console.log("PR failed due to existing channel or role of the same name");
        }

    }
    else if (cmd == "delete" || cmd == "-d") {
        let name = args.shift().toLowerCase();
        deleteShit(name, msg)
    }
    else if (cmd == "addrole" || cmd == "-ar") {
        let name = args.shift().toLowerCase();
        let role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === name);
        if (role !== undefined) {
            if (Array.isArray(rooms[msg.author.id]) && rooms[msg.author.id].find(r => r == role.id)) {
                msg.mentions.members.each(member => {
                    member.roles.add(role);
                })
            } else { console.log("AR ERR: does not exist in array thing") }
        } else { console.log("AR ERR: undefined role") }
    }
    else if (cmd == "removerole" || cmd == "-rr") {
        let name = args.shift().toLowerCase();
        let role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === name);
        if (role !== undefined) {
            if (Array.isArray(rooms[msg.author.id]) && rooms[msg.author.id].find(r => r == role.id)) {
                msg.mentions.members.each(member => {
                    member.roles.remove(role);
                })
            } else { console.log("RR ERR: does not exist in array thing") }
        } else { console.log("RR ERR: undefined role") }
    }
    else if (cmd == "kick" || "-k") {
        let channelname = msg.member.voice.channel.name;
        //console.log(channelname);
        const role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === channelname.toLowerCase());
        if (Array.isArray(rooms[msg.author.id]) && rooms[msg.author.id].find(r => r == role.id)) {
            msg.mentions.members.each(member => {
                member.voice.setChannel(null);
            });
        }
        else {
            console.log(msg.author.username + " does not have the ability to disconnect users.");
        }
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
    }, 1000);
}

function deleteShit(name, msg) {
    let roleNameFlag = msg.guild.roles.cache.find(role => role.name.toLowerCase() === name);
    let channelNameFlag = msg.guild.channels.cache.find(channel => channel.name.toLowerCase() === name);
    let channelID = "799380327654490114";

    //let channel = bot.guilds.get('729219573290762282').channels.cache.find(c => c.id == channelID);
    //console.log(channel);
    if (channelNameFlag !== undefined) {
        if (channelNameFlag.parentID == PCCategoryID) {
            const everyoneRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "@everyone");
            //channelNameFlag.overwritePermissions(everyoneRole, { 'CONNECT': true });
            channelNameFlag.delete();
            if (roleNameFlag !== undefined) roleNameFlag.delete();
            if (rooms[msg.author.id] !== undefined) {
                let idx = "";
                for (let i = 0; i < rooms[msg.author.id].length; i++) {
                    if (rooms[msg.author.id][i] == roleNameFlag.id)
                        idx = i;
                }
                rooms[msg.author.id].splice(idx, 1);
                if (rooms[msg.author.id].length < 1) {
                    let roomKeys = Object.keys(rooms);
                    let idx2 = roomKeys.find(key => key === msg.author.id);
                    delete rooms[idx2];
                }
                //console.log(rooms);
            }

        }
        else {
            console.log("User [" + msg.author.username + "] tried to delete a none PR channel/role.");
        }
    }
}

/*
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
*/