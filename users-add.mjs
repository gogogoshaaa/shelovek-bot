import { VK, API, Updates, getRandomId } from 'vk-io'
import VKCaptchaSolver from 'vk-captchasolver'
import * as fs from 'fs'
import { setTimeout } from 'timers/promises'
import pm2 from 'pm2'

const token = "vk1.a.UQh9DXoplYDmYWg8xkp7Bpki-1HeEMyBsKD1lpv_Zhv2fh_smrntTYRE61DKqb1I9_ZRMUvdMzEvn8eSlzkwTRMi-b8NjtO-kwpYZ07Tkov8MAmdYzwN8G1BmInhzHApvXAMLY25bgRG134Dv70iXb2BfofvLJzpmprKWb7bpEdkA4z7pRnDXJctx7v00j_j-7JdFCXIo7zn-15JO4SC3g"

const adminID = 406140312

const vk = new VK({
	token: token
})

const api = new API({
    token: token
})

const updates = new Updates({
    api
})

let type = "autolike"
let userToChange

console.log("users-add script started")

updates.startPolling()
.catch((error) => {
    console.log(error)
    return
})

updates.on('message_new', async (message) => {
    if(message.senderId != adminID) {
        return
    }
    if(!message.text) {
        return
    }
    let text = message.text

    if(text.toLowerCase() == "пользователи") {

        let likes = JSON.parse(fs.readFileSync('./data/like-data.json'))
        let games = JSON.parse(fs.readFileSync('./data/games-data.json'))
        let likeUsers = ""
        let gameUsers = ""
        likes.forEach((user) => {
            likeUsers = likeUsers + `${user.name} @id${user.vkid} \n`
        })
        games.forEach((user) => {
            gameUsers = likeUsers + `${user.name} @id${user.vkid} \n`
        })
        console.log(likeUsers)

        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: adminID,
            message: `Пользователи автолайка: \n${likeUsers}`
        })
        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: adminID,
            message: `Пользователи автоигр: \n${gameUsers}`
        })
    }

    if(text.toLowerCase() == "автолайк") {
        type = "autolike"
        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: adminID,
            message: "Введи токен пользователя в формате t *token*, чтобы подключить его к автолайку"
        })
        return
    }
    if(text.toLowerCase() == "игры") {
        type = "games"
        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: adminID,
            message: "Введи токен пользователя в формате t *token*, чтобы подключить его к играм"
        })
        return
    }
    if(text.toLowerCase() == "всё") {
        type = "all"
        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: adminID,
            message: "Введи токен пользователя в формате t *token*, чтобы подключить его к играм и автолайку"
        })
        return
    }

    if(text.substring(0, 9).toLowerCase() == "изменить ") {
        userToChange = text.substring(9)

        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: adminID,
            message: `Жду новый токен для пользователя в формате "c *token*"`
        })
    }

    if(text.substring(0, 2).toLowerCase() == "c ") {
        if(!userToChange) {
            await vk.api.messages.send({
                random_id: getRandomId(),
                peer_id: adminID,
                message: `Не указан пользователь для изменения`
            })
            return
        }

        let newToken = text.substring(2)

        let likes = fs.readFileSync('./data/like-data.json')
        let likeUsers = JSON.parse(likes)
        let games = fs.readFileSync('./data/games-data.json')
        let gameUsers = JSON.parse(games)

        let currentUserLikes = likeUsers.filter(user => user.vkid == userToChange)
        let currentUserGames = gameUsers.filter(user => user.vkid == userToChange)

        if(currentUserLikes.length < 1 && currentUserGames.length < 1) {
            await vk.api.messages.send({
                random_id: getRandomId(),
                peer_id: adminID,
                message: `Такой пользователь не найден`
            })
            return
        }

        if(currentUserLikes.length > 0 && currentUserGames.length > 0) {

            currentUserLikes[0].token = newToken
            currentUserGames[0].token = newToken

            likeUsers = likeUsers.filter(user => user.vkid != userToChange)
            likeUsers.push(currentUserLikes)

            gameUsers = gameUsers.filter(user => user.vkid != userToChange)
            gameUsers.push(currentUserGames)

        }
        else if (currentUserLikes.length > 0 && currentUserGames.length < 1) {

            currentUserLikes[0].token = newToken

            likeUsers = likeUsers.filter(user => user.vkid != userToChange)
            likeUsers.push(currentUserLikes)

        } else if (currentUserLikes.length < 1 && currentUserGames.length > 0) {

            currentUserGames[0].token = newToken

            gameUsers = gameUsers.filter(user => user.vkid != userToChange)
            gameUsers.push(currentUserGames)

        }

        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: adminID,
            message: `Пользователь обновлён`
        })

        fs.writeFileSync('./data/like-data.json', JSON.stringify(likeUsers))
        fs.writeFileSync('./data/games-data.json', JSON.stringify(gameUsers))

        pm2.connect(() => {
            pm2.restart("autolike-all")
            pm2.restart("autoplay-all")
        })

    }

    if(text.substring(0, 2).toLowerCase() == "d ") {
        let userToDelete = text.substring(2)

        let likes = fs.readFileSync('./data/like-data.json')
        let likeUsers = JSON.parse(likes)
        let games = fs.readFileSync('./data/games-data.json')
        let gameUsers = JSON.parse(games)

        likeUsers = likeUsers.filter(user => user.vkid !== userToDelete)
        gameUsers = gameUsers.filter(user => user.vkid !== userToDelete)


        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: adminID,
            message: `Пользователь удалён`
        })

        fs.writeFileSync('./data/like-data.json', JSON.stringify(likeUsers))
        fs.writeFileSync('./data/games-data.json', JSON.stringify(gameUsers))

        pm2.connect(() => {
            pm2.restart("autolike-all")
            pm2.restart("autoplay-all")
        })
    }

    if(text.substring(0, 2).toLowerCase() == "t " || text.substring(0, 2).toLowerCase()  == "т ") {
        console.log("adding the new token...")
        let newToken = text.substring(2)
        let user = {}

        let newUser = new VK({
            token: newToken
        })

        await newUser.api.users.get({

        })
        .then(async (response) => {

            let likes = fs.readFileSync('./data/like-data.json')
            let likeUsers = JSON.parse(likes)
            let games = fs.readFileSync('./data/games-data.json')
            let gameUsers = JSON.parse(games)

            user.name = response[0].first_name
            user.surname = response[0].last_name
            user.vkid = response[0].id

            if(type == "autolike") {
                let currentUserLikes = likeUsers.filter(u => u.vkid == user.vkid)
                if(currentUserLikes.length > 0) {
                    await vk.api.messages.send({
                        random_id: getRandomId(),
                        peer_id: adminID,
                        message: `Пользователь ${user.name} ${user.surname} уже существует`
                    })
                    return
                }
                likeUsers.push({
                    name: user.name,
                    surname: user.surname,
                    vkid: user.vkid,
                    token: newToken
                })
            }
            if(type == "games") {
                let currentUserGames = gameUsers.filter(u => u.vkid == user.vkid)
                if(currentUserGames.length > 0) {
                    await vk.api.messages.send({
                        random_id: getRandomId(),
                        peer_id: adminID,
                        message: `Пользователь ${user.name} ${user.surname} уже существует`
                    })
                    return
                }
                gameUsers.push({
                    name: user.name,
                    surname: user.surname,
                    vkid: user.vkid,
                    token: newToken
                })
            }
            if(type == "all") {
                let currentUserLikes = likeUsers.filter(u => u.vkid == user.vkid)
                let currentUserGames = gameUsers.filter(u => u.vkid == user.vkid)
                if(currentUserLikes.length > 0 || currentUserGames.length > 0) {
                    await vk.api.messages.send({
                        random_id: getRandomId(),
                        peer_id: adminID,
                        message: `Пользователь ${user.name} ${user.surname} уже существует`
                    })
                    return
                }

                likeUsers.push({
                    name: user.name,
                    surname: user.surname,
                    vkid: user.vkid,
                    token: newToken
                })
                gameUsers.push({
                    name: user.name,
                    surname: user.surname,
                    vkid: user.vkid,
                    token: newToken
                })
            }
            console.log("user added")

            await vk.api.messages.send({
                random_id: getRandomId(),
                peer_id: adminID,
                message: `Пользователь ${user.name} ${user.surname} (@id${user.vkid}) добавлен`
            })

            fs.writeFileSync('./data/like-data.json', JSON.stringify(likeUsers))
            fs.writeFileSync('./data/games-data.json', JSON.stringify(gameUsers))

            pm2.connect(() => {
                pm2.restart("autolike-all")
                pm2.restart("autoplay-all")
            })
        })
        .catch(async (error) => {

            if(JSON.stringify(error).includes("invalid access_token")) {
                error = "Неправильный токен"
            }
            console.log(error)

            await vk.api.messages.send({
                random_id: getRandomId(),
                peer_id: adminID,
                message: error
            })
        })
    }
})
