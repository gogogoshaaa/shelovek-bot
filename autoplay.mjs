import { VK, API, Updates, getRandomId } from 'vk-io'
import VKCaptchaSolver from 'vk-captchasolver'
import { setTimeout } from 'timers/promises'

process.on('uncaughtException', function(error) {
	error = JSON.stringify(error).toLowerCase()

	if(error.includes("was aborted")) {
		error = "abort"
	}
	if(error.includes("invalid access_token")) {
		error = "invalid token"
	}
	if(error.includes("you are in users blacklist")) {
		error = "in users blacklist"
	}
	if(error.includes("captcha needed")) {
		error = "captcha needed"
	}
	if(error.includes("unknown error")) {
		error = "unknown error"
	}
	if(error.includes("internal server error")) {
		error = "internal server error"
	}
    console.log("some error: ", error)
})

import users from "./games-data.json" assert { type: 'json' }

console.log("games monitoring started...")


users.filter(user => user.token !== null).forEach(async (user, userID) => {

	let token = user.token

	let vk = await new VK({
		token: token
	})
	
	let igra
	let canSendMusic = false
	
	let answeredMessages = []

	vk.updates.startPolling()
	
	vk.updates.on('message_new', async (message) => {

		if(message.senderId != -210575018 || !message.isChat) {
			return
		}

		const dID = message.peerId
	
		let senderId = message.senderId
		let text = message.text
	
		if(!text) {
			return
		}
	
		if(answeredMessages.includes(message.id)) {
			return
		}

		if(message.attachments[0] && text.includes(`мнению победит`)) {
			
				let pollID = message.attachments[0].id

				let poll = await vk.api.polls.getById({
					owner_id: -210575018,
					poll_id: pollID
				})

				await vk.api.polls.addVote({
					poll_id: pollID,
					answer_ids: poll.answers[1].id
				})

				console.log(user.name, user.surname, "voted")
				return
		}

		if(text.includes(`уже в процессе запуска`)) {
			canSendMusic = true
		}
	
		if(text.includes(`предлагает за 30 секунд`)) {
			answeredMessages.push(message.id)
			igra = message.id
			canSendMusic = true
		}

		if(text.includes(`Всё правильно`)) {
				answeredMessages.push(message.id)
				let result = text.split(`— `)[1].split(`».`)[0]
				let getid = await vk.api.messages.getById({
					message_ids: igra
				})
		
				getid.items[0].keyboard.buttons.forEach(async (button, buttonID) => {
					
					if(getid.items[0].keyboard.buttons[buttonID][0].action.label == `${result}`) {

						let payload = getid.items[0].keyboard.buttons[buttonID][0].action.payload
	
						sendAnswer(result, payload)
					}
					
				})
		}

		if(text.includes(`игра завершена`)) {
			canSendMusic = false
		}

		async function sendAnswer (result, payload) {
			if(!canSendMusic) {
				return
			}
			await vk.api.messages.send({
				random_id: Math.floor(Math.random() * (10000 - 1 + 1) + 1),
				peer_id: dID,
				message: `@meow_best_bot ${result}`,
				payload: `${payload}`
			})
			.then(() => {
				console.log("music sent:", user.name, user.surname)
				canSendMusic = false
			})
			.catch(async (error) => {

                error = JSON.stringify(error)

				if(error.includes("was aborted")) {
					error = "abort: "
				}
				if(error.includes("invalid access_token")) {
					error = "invalid token: "
				}
				if(error.includes("you are in users blacklist")) {
					error = "in users blacklist: "
				}
				if(error.includes("captcha needed")) {
					error = "captcha needed: "
				}
				if(error.includes("unknown error")) {
					error = "unknown error: "
				}
				if(error.includes("internal server error")) {
					error = "internal server error: "
				}
	
				console.log(error, ", resending...: ", user.name, user.surname)

				await vk.api.messages.send({
					random_id: Math.floor(Math.random() * (10000 - 1 + 1) + 1),
					peer_id: dID,
					message: `@meow_best_bot ${result}`,
					payload: `${payload}`
				})
	
				if(error.captchaImg) {
					let captcha_url = error.captchaImg
					let captchaSid = error.captchaSid
					let result = await VKCaptchaSolver(captcha_url)
					console.log("solving captcha...", result)
					await vk.api.messages.send({
						random_id: Math.floor(Math.random() * (10000 - 1 + 1) + 1),
						peer_id: dID,
						message: `@meow_best_bot ${result}`,
						payload: `${getid.items[0].keyboard.buttons[buttonID][0].action.payload}`,
						captcha_sid: captchaSid,
						captcha_key: result
					})
	
					console.log("captcha solved: ", user.name, user.surname)
				
				}
			})
		}
	})
})