import { VK, API, Updates } from 'vk-io'
import VKCaptchaSolver from 'vk-captchasolver'
import { setTimeout } from 'timers/promises'

import users from "./like-data.json" assert { type: 'json' }


let token = "vk1.a.TBSoI_yoMh02ispZPdSG2xIrIYIiRbckRgEggrZAkrnxawJP2nGai3JAGz12G3VP5xNBzMYbjxwhFDi1wCGfTXDngCo6vpAbOf286JsRDBEetMSt_BSXFn5EmHo4lI9grswm2H9qn_6Xq8xyDHl-3WNuxBJtBNJ0PmClzr95TgbMmN4z5p2mXI1u3fCES-mHKDG47taMzsJPkkwIG-bhKA"

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
