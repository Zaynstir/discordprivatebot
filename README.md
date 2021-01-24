# Private Bot #

**Description:** 
This discord bot dynamically creates and destroys private chat rooms and corresponding roles depending on the commands inserted by users. This bot is primarily used if members of a discord server was a private room to talk, but do not want to make a group dm.
This bot uses a database to keep track of the rooms/roles. So if the bot crashes, it will still be able to run like normal once it is back up.

**Setup:** There are a couple steps to add the bot to your server
1. Create a category named 'Private Channels'
2. Go to this link: https://discord.com/oauth2/authorize?client_id=798368592277667840&scope=bot&permissions=2147483647
3. You should be good to go

**Prefix:** !pr

**Commands:**
* 'add', '-a' -- add a private room and role
  * SYNTAX: !pr add [name] [@user1] [@user2]
* 'delete', '-d' -- delete a private room and role
  * SYNTAX: !pr delete [name]
* 'addrole', '-ar' -- adds a role to user(s)
  * SYNTAX: !pr addrole [name] [@user1] [@user2]
* 'removerole', '-rr' -- remove a role from user(s)
  * SYNTAX: !pr removerole [name] [@user1] [@user2]
* 'kick', '-k' -- kick a user from a voice channel
  * SYNTAX: !pr kick [@user1] [@user2]

If a user creates a room/role 'test', then they are the only ones who can add/remove roles for 'test', kick users from 'test', and delete 'test'.
Also, no user can create/delete a role/room that already exists.

**Future Plans:**
1. Incorporate feedback messages so that those issuing commands understands what is going on.
1. Incorporate a database to keep track of logs for troubleshooting in the future.
1. Explore possible security flaws
1. Auto-create 'Private Channels' category upon add bot to server if it does not exist.
1. More commands to add more features and to make using Private Bot more usuable.
1. Allow for a role with a specified name to override and take control of a room. (Helps abuse from people creating rooms harassing people).
