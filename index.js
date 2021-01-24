const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require('./config.json')
require('dotenv').config();
var mysql = require('mysql');
const prefix = process.env.Prefix;
const host = process.env.dbhost;
const user = process.env.dbuser;
const pass = process.env.dbpass;

//https://discord.com/oauth2/authorize?client_id=798368592277667840&scope=bot&permissions=2147483647

let timer;

var conn = mysql.createConnection({
    host: host,
    user: user,
    password: pass,
    port: '3306'
});


//db connection
conn.connect(err => {
    if (err) {
        console.error("Error Connecting: " + err.stack);
        return;
    }
    //console.log("Connected as ID: " + conn.threadId);
});


bot.login(process.env.BOT_TOKEN);

bot.once('ready', () => {
    console.log("Ready");
});

bot.on('message', msg => {
    let serverid = msg.guild.id;
    let PrivateChannelCategory = msg.guild.channels.cache.find(channel => channel.name.toLowerCase() === "private channels");
    if (PrivateChannelCategory === undefined) {
        console.log("needs a PC Category");
        return;
    }
    else {
        let PCID = PrivateChannelCategory.id;

        let submitted = msg.author;
        if (!msg.content.startsWith(prefix)) return;
        if (!msg.member) return;
        let args = msg.content.slice(prefix.length).trim().split(' ');
        let cmd = args.shift().toLowerCase();


        //get cmds
        if (cmd == "help" || cmd == "-h") {
            let str = "Hello, I create private rooms so that people do their own thing if they want.\n";
            str += "\nCommand List\n-------------------------\n";
            str += "Prefix: !pr\n";


            str += "\'add\', \'-a\' -- add a private room and role .... SYNTAX: !pr add [name] [@user1] [@user2]\n";
            str += "\'delete\',\'-d\' -- delete a private room and role .... SYNTAX: !pr delete [name]\n";
            str += "\'addrole\', \'-ar\' -- add a role to a user .... SYNTAX: !pr addrole [name] [@user1] [@user2]\n";
            str += "\'removerole\', \'-rr\' -- remove a role from a user .... SYNTAX: !pr removerole [name] [@user1] [@user2]\n";
            str += "\'kick\', \'-k\' -- kick a user from a voice channel .... SYNTAX: !pr kick [@user1] [@user2]\n";


            msg.channel.send(str);
        }
        //add a pr room and role
        else if (cmd == "add" || cmd == "-a") {
            let name = args.shift().toLowerCase();
            console.log("User [" + submitted.username + "] is attempting to create PR with a name of [" + name + "]");
            let roleNameFlag = msg.guild.roles.cache.find(role => role.name.toLowerCase() === name);
            let channelNameFlag = msg.guild.channels.cache.find(channel => channel.name.toLowerCase() === name);
            if (roleNameFlag === undefined && channelNameFlag === undefined) {



                msg.guild.roles.create({
                    data: {
                        name: name,
                        color: "BLUE"
                    },
                    reason: 'privateroom'
                }).then(role => {
                    msg.member.roles.add(role);


                    conn.query("INSERT INTO DiscordBots.privatebot_default (serverid, PCCID, memberid, prid) VALUES (" + serverid + ", " + PCID + ", " + submitted.id + ", " + role.id + ")", (err, result, fields) => {
                        if (err) throw err;
                    });

                    const everyoneRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "@everyone");

                    msg.guild.channels.create(name, {
                        type: 'voice',
                        reason: 'privateroom',
                        parent: PCID,
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

                        msg.mentions.members.each(member => {
                            member.roles.add(role);
                        })
                    }).catch(console.error);

                }).catch(console.error);
            }
            else {
                console.log("PR failed due to existing channel or role of the same name");
            }

        }
        //delete pr channel role
        else if (cmd == "delete" || cmd == "-d") {
            let name = args.shift().toLowerCase();
            deleteShit(name, msg)
        }
        //add a role to a member
        else if (cmd == "addrole" || cmd == "-ar") {
            let name = args.shift().toLowerCase();
            let role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === name);
            if (role !== undefined) {

                conn.query("SELECT * FROM DiscordBots.privatebot_default WHERE serverid = " + serverid + " AND memberid = " + submitted.id + " AND prid = " + role.id, (err, result, fields) => {
                    if (err) throw err;
                    console.log("SELECT SHIT");
                    console.log(result);
                    if (result.length > 0) {
                        msg.mentions.members.each(member => {
                            member.roles.add(role);
                        });
                    }
                    else {
                        console.log("AR ERR: does not exist in db");
                    }
                });


            } else { console.log("AR ERR: undefined role") }
        }
        //remove a role from a member
        else if (cmd == "removerole" || cmd == "-rr") {
            let name = args.shift().toLowerCase();
            let role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === name);
            if (role !== undefined) {

                conn.query("SELECT * FROM DiscordBots.privatebot_default WHERE serverid = " + serverid + " AND memberid = " + submitted.id + " AND prid = " + role.id, (err, result, fields) => {
                    if (err) throw err;
                    console.log("SELECT SHIT");
                    console.log(result);
                    if (result.length > 0) {
                        msg.mentions.members.each(member => {
                            member.roles.remove(role);
                        });
                    }
                    else {
                        console.log("RR ERR: does not exist in db");
                    }
                });

            } else { console.log("RR ERR: undefined role") }
        }
        //kick a member from a voice channel
        else if (cmd == "kick" || "-k") {
            let channelname = msg.member.voice.channel.name;
            const role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === channelname.toLowerCase());


            conn.query("SELECT * FROM DiscordBots.privatebot_default WHERE serverid = " + serverid + " AND memberid = " + submitted.id + " AND prid = " + role.id, (err, result, fields) => {
                if (err) throw err;
                console.log("SELECT SHIT");
                console.log(result);
                if (result.length > 0) {
                    msg.mentions.members.each(member => {
                        member.voice.setChannel(null);
                    });
                }
                else {
                    console.log(msg.author.username + " does not have the ability to disconnect users.");
                }
            });
        }
    }
});

function setTimer(channel, name, msg) {
    setTimeout(() => {
        let mems = channel.members;
        let i = 0;
        for (let [snowflake, guildMember] of mems) {
            i++;
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
    let PrivateChannelCategory = msg.guild.channels.cache.find(channel => channel.name.toLowerCase() === "private channels");
    if (PrivateChannelCategory === undefined) {
        console.log("needs a PC Category");
        return;
    }
    else {
        let PCID = PrivateChannelCategory.id;
        let serverid = msg.guild.id;
        let channelID = "799380327654490114";
        let submitted = msg.author;

        if (channelNameFlag !== undefined) {
            if (channelNameFlag.parentID == PCID) {
                channelNameFlag.delete();
                if (roleNameFlag !== undefined) roleNameFlag.delete();
                conn.query("DELETE FROM DiscordBots.privatebot_default WHERE serverid = " + serverid + " AND memberid = " + submitted.id + " AND prid = " + roleNameFlag.id, (err, result) => {
                    if (err) throw err;
                });
            }
            else {
                console.log("User [" + msg.author.username + "] tried to delete a none PR channel/role.");
            }
        }
    }
}