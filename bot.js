import { info } from "console";
import * as Discord from "discord.js";
import { stat, writeFile } from "fs";
import * as fs from "fs/promises"
import { start } from "repl";

const client = new Discord.Client()
const prefix = "dt"
const address = './data.json'
const jsonString = await fs.readFile(address, 'utf-8')
const data = JSON.parse(jsonString)

let today = new Date()
let date = `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`
let time = `${today.getHours()}:${today.getMinutes()}`
let startEvent = `${date} - ${time}`

const Sentences = {
    1: "we love each other",
    2: "we are the best couples",
    3: "long live our ship",
    4: "we are the best",
    5: "we understand each other",
    6: "love yourself",
    7: "i love you partner",
    8: "we will be number one",
    9: "we are the champions",
    10: "let us be alone"
}

const Jumble = {
    1: ["evlo", "love"],
    2: ["upeloc", "couple"],
    3: ["sorevl", "lovers"],
    4: ["bjueml", "jumble"],
    5: ["phsi", "ship"],
    6: ["idatgn", "dating"],
    7: ["nideis", "inside"],
    8: ["soralnep", "personal"],
    9: ["urbh", "bruh"],
    10:["orcsidd", "discord"]
}


async function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


async function dumpInformation(i, lover1, lover2, points, start, end, command) {

    if (command == "newDate") {
        let status = await dateChecker(lover1, lover2, data)
        if (status == "single") {
            const newDate = 
            {
                "lover1": `${lover1}`,
                "lover2": `${lover2}`,
                "points": points,
                "start": start,
                "end": end,
                "dateTime": startEvent
            }

            let index = data.length
            data[index] = newDate
            fs.writeFile(address, JSON.stringify(data, null, 2)).catch(console.log)

            const information = [points, index]
            return information

        } else {
            if (status == "both") {
                let text = "You both are already dating"
                return text
            }
            else if (status == "author") {
                let text = "You are already dating someone, this game is pure, breakup with your partner if you are looking someone **(-5)**"
                data[await indexFinder(lover1, data)].points -= 5
                fs.writeFile(address, JSON.stringify(data, null, 2)).catch(console.log)
                return text
            }
            else {
                let text = lover2+" is already dating someone"
                return text
            }
        }
    }

    if (command == "showStatus") {
        let index = await indexFinder(lover1, data)
        const information = data[index]

        let timeSpent = (end-information.start)/(60*60*24*1000)
        if (timeSpent<1) {
            timeSpent = "Less than 1 day"
        } else {
            timeSpent = parseInt(timeSpent)
        }

        try {
            if (timeSpent<1 && timeSpent > 0.5) {
                pointsChange(lover1, 5, '+')
            }
            if (timeSpent<3 && timeSpent>=1) {
                pointsChange(lover1, 10, '+')
            }
            if (timeSpent >= 3 && timeSpent < 6) {
                pointsChange(lover1, 20, '+')
            }
            if (timeSpent >=6) {
                pointsChange(lover1, 50, '+')
            }
        } catch (err) {
            console.log(err)
        }


        let status = ""
        if (information.points == 10) {
            status = "No Progress"
        }
        else if (information.points<10 && information.points > 0) {
            status = "Poor"
        }
        else if (information.points<210 && information.points>10) {
            status = "Good"
        }
        else if (information.points<500 && information>=210) {
            status = "Excelent"
        }
        else if (information.points>=500) {
            status = "Made for Each other"
        } else {
            status = "You both should probably break up"
        }

        const ouputStatement = [information.lover1, information.lover2, information.points, timeSpent, information.dateTime, status, index]
        return ouputStatement
    }
    
}

async function indexFinder(name, jsonFile) {
    let i=0
    while (i < jsonFile.length) {
        if (jsonFile[i].lover1 == name || jsonFile[i].lover2 == name) {
            return i
        } else {
            i++
        }
    }
}

async function dateChecker(name1, name2, jsonFile) {
    let i=0
    while (i < jsonFile.length) {
        if (jsonFile[i].lover1 == name1 || jsonFile[i].lover2 == name1) {
            
            if (jsonFile[i].lover1 == name2 || jsonFile[i].lover2 == name2) {
                let text = 'both'
                return text
            } else {
                let text = 'author'
                return text
            }
        }

        else if (jsonFile[i].lover1 == name2 || jsonFile[i].lover2 == name2) {
            let text = "mention"
            return text
        }

        else {
            i++
            continue
        }
    }
    let text = "single"
    return text
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function pointsChange(name, value, command) {
    if (command == "+") {
        data[await indexFinder(name, data)].points += parseInt(value)
        fs.writeFile(address, JSON.stringify(data, null, 2)).catch(console.log)
    } else { 
        data[await indexFinder(name, data)].points -= parseInt(value)
        fs.writeFile(address, JSON.stringify(data, null, 2)).catch(console.log)
    }
}


client.on("ready", async() => {
    console.log("Connected as " + client.user.tag);

    client.user.setActivity("'dt'", { type: "LISTENING" });

    client.guilds.cache.forEach((guild) => {
        console.log(guild.name);
        guild.channels.cache.forEach((channel) => {});
    });
})

client.on("message", async(message) => {
    const author = message.author
    const mention = message.mentions.users.first()
    const msg = message.content.toLowerCase()

    function send(msg) {
       message.channel.send(msg)
    }

    async function sendStatus() {
        const reciveInfo = await dumpInformation(null, author.username, null, null, null, message.createdTimestamp, "showStatus")
        let name1 = reciveInfo[0].toUpperCase()
        let name2 = reciveInfo[1].toUpperCase()
        let score = reciveInfo[2]
        let time = reciveInfo[3]
        let dateTime = reciveInfo[4]
        let status = reciveInfo[5]
        let number = reciveInfo[6]

        const datingInformation = new Discord.MessageEmbed()
            .setTitle('❤️ DATE INFORMATION')
            .setDescription('Complete **tasks** and make your date **last long** to gain more **points** and be the **number one couple**')
            
            .addFields(
                {
                    name: '`Lovers:`', value: `**${name1}** and **${name2}**`
                },
                {
                    name: '`Date Score:`', value: `${score}`
                },
                {
                    name: '`Date Started:`', value: `${dateTime}`
                },
                {
                    name: '`Time Spent:`', value: `${time}`
                },
                {
                    name: '`Date Status:.`', value: `${status}`
                },
                {
                    name: '`Lucky Number:`', value: `${number}`
                }
            )
        send(datingInformation)
    }

    async function writeLoveSentence() {
        let embed = new Discord.MessageEmbed()
            .setTitle('Rewrite the Sentence')
            .setDescription(`${author} \`Be ready in 3 seconds\``)
        send(embed)

        await sleep(3000)

        let taskSentence = Sentences[await getRandomInt(1,11)]
        let taskEmbed = new Discord.MessageEmbed()
            .setTitle(`TASK for ${author.username.toUpperCase()}`)
            .setDescription('Write the given sentence within **8 seconds**')
            .addField('** **', `\`${taskSentence}\``)
        send(taskEmbed)

        await sleep(8200)
        
        let text = null
        message.channel.messages.fetch({ limit: 1 }).then(async messages => {
            messages.map(r => r.author == author && !r.content.includes('dt') ? text = r.content : text = false)

            if (text == taskSentence) {
                const taskEmbed = new Discord.MessageEmbed()
                    .setTitle(`✅ Task-1 Complete`)
                    .setDescription(`${mention}, your turn, be ready in **5 seconds**`)
                    .setFooter('+10 points')
                send(taskEmbed)

                pointsChange(author.username, 10, "+")

            } else {
                const taskEmbed = new Discord.MessageEmbed()
                    .setTitle(`❌ Task-1 gone Wrong`)
                    .setDescription(`${mention}, your turn, be ready in **5 seconds**`)
                    .setFooter('-5 points')
                send(taskEmbed)

                pointsChange(author.username, 5, "-")
            }
            
        })

        await sleep(5000)

        taskSentence = Sentences[await getRandomInt(1,11)]
        taskEmbed = new Discord.MessageEmbed()
            .setTitle(`TASK for ${mention.username.toUpperCase()}`)
            .setDescription('Write the given sentence within **8 seconds**')
            .addField('** **', `\`${taskSentence}\``)
        send(taskEmbed)

        await sleep(8200)

        let text2 = null
        message.channel.messages.fetch({ limit: 1 }).then(async messages => {
            messages.map(r => r.author == mention && !r.content.includes('dt') ? text2 = r.content : text2 = false)

            if (text2 == taskSentence) {
                const taskEmbed = new Discord.MessageEmbed()
                    .setTitle(`✅ Task-2 Complete`)
                    .setFooter('+10 points')
                send(taskEmbed)

                pointsChange(author.username, 10, "+")

            } else {
                const taskEmbed = new Discord.MessageEmbed()
                    .setTitle(`❌ Task-2 gone Wrong`)
                    .setFooter('-5 points')
                send(taskEmbed)

                pointsChange(author.username, 5, "-")
            }
            
        })
        await sleep(1000)
        sendStatus()
    }

    async function jumbleWords() {
        let embed = new Discord.MessageEmbed()
            .setTitle('Jumble Words')
            .setDescription(`${author} \`Be ready in 3 seconds\``)
        send(embed)

        await sleep(3000)

        let taskList = Jumble[await getRandomInt(1,11)]
        let taskJumbleWord = taskList[0]
        let taskWord = taskList[1]

        let taskEmbed = new Discord.MessageEmbed()
            .setTitle(`TASK for ${author.username.toUpperCase()}`)
            .setDescription('Correct the given jumble words in **8 seconds**')
            .addField('** **', `\`${taskJumbleWord}\``)
        send(taskEmbed)

        await sleep(8200)
        
        let text = null
        message.channel.messages.fetch({ limit: 1 }).then(async messages => {
            messages.map(r => r.author == author && !r.content.includes('dt') ? text = r.content : text = false)

            if (text == taskWord) {
                const taskEmbed = new Discord.MessageEmbed()
                    .setTitle(`✅ Task-1 Complete`)
                    .setDescription(`${mention}, your turn, be ready in **5 seconds**`)
                    .setFooter('+10 points')
                send(taskEmbed)

                pointsChange(author.username, 10, "+")

            } else {
                const taskEmbed = new Discord.MessageEmbed()
                    .setTitle(`❌ Task-1 gone Wrong`)
                    .setDescription(`${mention}, your turn, be ready in **5 seconds**`)
                    .setFooter(`-5 points (correct word: ${taskWord})`)
                send(taskEmbed)

                pointsChange(author.username, 5, "-")
            }
            
        })

        await sleep(5000)

        let taskList2 = Jumble[await getRandomInt(1,11)]
        let taskJumbleWord2 = taskList2[0]
        let taskWord2 = taskList2[1]

        taskEmbed = new Discord.MessageEmbed()
            .setTitle(`TASK for ${mention.username.toUpperCase()}`)
            .setDescription('Correct the given jumble words in **8 seconds**')
            .addField('** **', `\`${taskJumbleWord2}\``)
        send(taskEmbed)

        await sleep(8200)

        let text2 = null
        message.channel.messages.fetch({ limit: 1 }).then(async messages => {
            messages.map(r => r.author == mention && !r.content.includes('dt') ? text2 = r.content : text2 = false)

            if (text2 == taskWord2) {
                const taskEmbed = new Discord.MessageEmbed()
                    .setTitle(`✅ Task-2 Complete`)
                    .setFooter('+10 points')
                send(taskEmbed)

                pointsChange(author.username, 10, "+")

            } else {
                const taskEmbed = new Discord.MessageEmbed()
                    .setTitle(`❌ Task-2 gone Wrong`)
                    .setFooter(`-5 points (correct word: ${taskWord2})`)
                send(taskEmbed)

                pointsChange(author.username, 5, "-")
            }
            
        })
        await sleep(1000)
        sendStatus()
    }

    if (msg.startsWith(prefix+' date')) {
       if (message.mentions.members.size > 1) {
            const date_embed = new Discord.MessageEmbed()
                .setDescription("❌ Dating 1 person is far better and meaningful, so stick to that.")
                .setColor('RANDOM')
            message.channel.send(date_embed)
       }

       else if (mention == author) {
        const date_embed = new Discord.MessageEmbed()
            .setDescription("**Wait, What?**")
            .setColor('RANDOM')
        message.channel.send(date_embed)
       }

       else if (await dateChecker(author.username, mention.username, data) !== "single") {
        const output = await dumpInformation(null, author.username, mention.username, null, null, null, "newDate")
        const date_embed = new Discord.MessageEmbed()
            .setDescription(output)
            .setColor("RANDOM")
        send(date_embed)
       }
       
       else {
            const date_embed = new Discord.MessageEmbed()
                .setDescription(`Lets ask for this date to ${mention} !`)
                .setColor('RANDOM')
            send(date_embed)

            send(`${mention}`)

            const date_embed2 = new Discord.MessageEmbed()
                .setTitle('PROPOSAL')
                .setDescription(`${mention} **,** ${author} **asked you for a DATE**`)
                .addField('** **', 'Reply by `yes/no` in the next 20 seconds')
                
                .setFooter('I too will declare the results after 20 seconds')
                .setColor('RANDOM')
            send(date_embed2)
            
            setTimeout(() => {
                message.channel.messages.fetch({ limit: 1 }).then(messages => {
                    let lastMessage = messages.first()
                    const propsalResponse = lastMessage.content.toLowerCase()

                    if (lastMessage.author.id == mention.id) {
                        if (propsalResponse == "yes") {
                            const date_embed = new Discord.MessageEmbed()
                                .setTitle('ACCEPTED')
                                .setDescription(`❤️ ${author} and ${mention} are **dating**`)
                                .setColor('RANDOM')

                            message.channel.send(date_embed).then(async (startDating) => {
                                let startTime = startDating.createdTimestamp
                                const reciveInfo = await dumpInformation(null, author.username, mention.username, 10, startTime, null, "newDate")
                            
                                let score = reciveInfo[0]
                                let luckyNumber = reciveInfo[1]

                                const datingInformation = new Discord.MessageEmbed()
                                    .setTitle('❤️ DATE INFORMATION')
                                    .setDescription('Complete **tasks** and make your date **last long** to gain more **points** and be the **number one couple**')
                                    
                                    .addFields(
                                        {
                                            name: '**Lovers:**', value: `${author} and ${mention}`
                                        },
                                        {
                                            name: '**Date Score:**', value: `${score}`
                                        },
                                        {
                                            name: '**Date Started:**', value: `${startEvent}`
                                        },
                                        {
                                            name: '**Lucky Number: **', value: `${luckyNumber}`
                                        }
                                    )

                                send(datingInformation)
                            })
                        }

                        else if (propsalResponse == "no") {
                            const date_embed = new Discord.MessageEmbed()
                                .setTitle('REJECTED')
                                .setDescription(`❤️❌ ${mention} **rejected** the proposal from ${author}`)
                                .setColor('RANDOM')
                            send(date_embed)
                        }

                        else {
                            lastMessage.reply("I didn't get you, *please you both try your match some other time!*")
                        }
                    } else {
                        message.reply('*Either their too shy to spit out feelings, or their offline!*')
                    }
                })
            }, 20000)
       }
    }

    if (msg.startsWith(prefix+' status')){
        sendStatus()
    }

    if (msg.startsWith(prefix+' task')) {
        if (mention !== author) {
            if (await dateChecker(author.username, "empty", data) == "author") {
                if (message.mentions.members.size == 0) {
                    message.reply('Please mention your partner `dt task @partner`')
                } else {
                    if (message.mentions.members.size > 1) {
                        const date_embed = new Discord.MessageEmbed()
                            .setDescription("❌ You can only date 1 person")
                            .setColor('RANDOM')
                        send(date_embed)
                    } else {
                        let check = await dateChecker(author.username, mention.username, data)
                        if (check !== "both") {
                            const date_embed = new Discord.MessageEmbed()
                                .setDescription("❌ You are dating someone else")
                                .setColor('RANDOM')
                            send(date_embed)

                        } else {
                            let task = await getRandomInt(1, 3)
                            if (task == 1) {
                                writeLoveSentence()
                            }
                            if (task == 2) {
                                jumbleWords()
                            }
                        }
                    }
                }
            } else {
                const date_embed = new Discord.MessageEmbed()
                    .setDescription("❌ You are not dating anyone")
                    .setColor('RANDOM')
                send(date_embed)
            }
        } else {
            send('`LOVE YOURSELF` : Live example (lol)')
        }
    }
})

client.login(TOKEN)
