import { VK, API, Updates } from 'vk-io'
import VKCaptchaSolver from 'vk-captchasolver'
import { setTimeout } from 'timers/promises'

import users from "./like-data.json" assert { type: 'json' }


let token = "vk1.a.UQh9DXoplYDmYWg8xkp7Bpki-1HeEMyBsKD1lpv_Zhv2fh_smrntTYRE61DKqb1I9_ZRMUvdMzEvn8eSlzkwTRMi-b8NjtO-kwpYZ07Tkov8MAmdYzwN8G1BmInhzHApvXAMLY25bgRG134Dv70iXb2BfofvLJzpmprKWb7bpEdkA4z7pRnDXJctx7v00j_j-7JdFCXIo7zn-15JO4SC3g"

const vk = new VK({
	token: token
})


process.on('uncaughtException', function(error) {
	error = JSON.stringify(error).toLowerCase()
    
    console.log("some error: ", error)
})

let sender = setInterval(send, 3000)

let index = 0

async function send () {

    let user = users[index]

    index++

    let toSend = "сообщение для рассылки"

    console.log("https://vk.com/id" + user.vkid)

    await vk.api.messages.send({
        random_id: Math.floor(Math.random() * (10000 - 1 + 1) + 1),
        peer_id: user.vkid,
        message: toSend,
    })
    .catch(async (error) => {
        console.log(error, error.captchaImg, error.captchaSid)
        if(error.captchaImg) {
            let captcha_url = error.captchaImg
            let captchaSid = error.captchaSid
            let result = await VKCaptchaSolver(captcha_url)
            console.log("resolving captcha...", result)
            await vk.api.messages.send({
                random_id: Math.floor(Math.random() * (10000 - 1 + 1) + 1),
                peer_id: user.vkid,
                message: toSend,
                captcha_sid: captchaSid,
                captcha_key: result
            })
            .then((response) => {
                console.log("captcha solved succesfully")
            })
        }
    })
}
