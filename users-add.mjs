import { VK, API, Updates, getRandomId } from 'vk-io'
import VKCaptchaSolver from 'vk-captchasolver'
import * as fs from 'fs'
import { setTimeout } from 'timers/promises'

const token = "vk1.a.TBSoI_yoMh02ispZPdSG2xIrIYIiRbckRgEggrZAkrnxawJP2nGai3JAGz12G3VP5xNBzMYbjxwhFDi1wCGfTXDngCo6vpAbOf286JsRDBEetMSt_BSXFn5EmHo4lI9grswm2H9qn_6Xq8xyDHl-3WNuxBJtBNJ0PmClzr95TgbMmN4z5p2mXI1u3fCES-mHKDG47taMzsJPkkwIG-bhKA"

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

updates.startPolling()
.catch((error) => {
    console.log(error)
    return
})

updates.on('message_new', async (message) => {
    if(message.senderId != 448409696) {
        return
    }
    if(!message.text) {
        return
    }
    let text = message.text

    if(text.toLowerCase() == "автолайк") {
        type = "autolike"
        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: 448409696,
            message: "Введи токен пользователя, чтобы подключить его к автолайку"
        })
        return
    }
    if(text.toLowerCase() == "игры") {
        type = "games"
        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: 448409696,
            message: "Введи токен пользователя, чтобы подключить его к играм"
        })
        return
    }
    if(text.toLowerCase() == "всё") {
        type = "all"
        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: 448409696,
            message: "Введи токен пользователя, чтобы подключить его к играм и автолайку"
        })
        return
    }

    if(text.substring(0, 9).toLowerCase() == "изменить ") {
        userToChange = text.substring(9)

        await vk.api.messages.send({
            random_id: getRandomId(),
            peer_id: 448409696,
            message: `Жду новый токен для пользователя в формате "c *token*"`
        })
    }

    if(text.substring(0, 2).toLowerCase() == "c ") {
        if(!userToChange) {
            await vk.api.messages.send({
                random_id: getRandomId(),
                peer_id: 448409696,
                message: `Не указан пользователь для изменения`
            })
            return
        }

        let newToken = text.substring(2)

        let likes = fs.readFileSync('./like-data.json')
        let likeUsers = JSON.parse(likes)
        let games = fs.readFileSync('./games-data.json')
        let gameUsers = JSON.parse(games)

        let currentUserLikes = likeUsers.filter(user => user.vkid == userToChange)
        let currentUserGames = gameUsers.filter(user => user.vkid == userToChange)

        if(currentUserLikes.length < 1 && currentUserGames.length < 1) {
            await vk.api.messages.send({
                random_id: getRandomId(),
                peer_id: 448409696,
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
            peer_id: 448409696,
            message: `Пользователь обновлён`
        })

        fs.writeFileSync('./like-data.json', JSON.stringify(likeUsers))
        fs.writeFileSync('./games-data.json', JSON.stringify(gameUsers))

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

            let likes = fs.readFileSync('./like-data.json')
            let likeUsers = JSON.parse(likes)
            let games = fs.readFileSync('./games-data.json')
            let gameUsers = JSON.parse(games)

            user.name = response[0].first_name
            user.surname = response[0].last_name
            user.vkid = response[0].id

            if(type == "autolike") {
                likeUsers.push({
                    name: user.name,
                    surname: user.surname,
                    vkid: user.vkid,
                    token: newToken
                })
            }
            if(type == "games") {
                gameUsers.push({
                    name: user.name,
                    surname: user.surname,
                    vkid: user.vkid,
                    token: newToken
                })
            }
            if(type == "all") {
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
                peer_id: 448409696,
                message: `Пользователь ${user.name} ${user.surname} (@id${user.vkid}) добавлен`
            })

            fs.writeFileSync('./like-data.json', JSON.stringify(likeUsers))
            fs.writeFileSync('./games-data.json', JSON.stringify(gameUsers))
        })
        .catch(async (error) => {

            if(JSON.stringify(error).includes("invalid access_token")) {
                error = "Неправильный токен"
            }
            console.log(error)

            await vk.api.messages.send({
                random_id: getRandomId(),
                peer_id: 448409696,
                message: errorText
            })
        })
    }
})
