import { VK, getRandomId } from 'vk-io'
import VKCaptchaSolver from 'vk-captchasolver'
import { setTimeout } from 'timers/promises'

import users from "./data/like-data.json" assert { type: 'json' }


console.log("posts monitoring started...")

let checkPostsInterval = setInterval(checkPosts, 5000)

const myvk = await new VK({
	token: "vk1.a.FzpZaD6K8jtAAH2Z7bJUmb4zRviNg7dtMtn6pJkkZ63gg0p9Foqjnb6TUFTucMRXCLkRxZjBVhgJSnjlU0YAj7LFne3nKOFePDmY1UXJg4vOqt-amx9CTSO0_D8w2A8B7uDf09VtkEdfVwxuk6rjAXTtc9WpOb-j6PvL_5ebQI7SwiPp8go6az-r0annYZm6tnIB8kV8531bYXuZQKRfoA"
})

let newPost = false


checkPosts()

async function checkPosts () {

	let postID

	let posts = await myvk.api.wall.get({
		owner_id: -210575018,
		count: 20,
	})
	
	await posts.items.forEach(async (post) => {
		let author = post.from_id
		let id = post.id
		if(!author || !id) {
			return
		}
	
		if(post.is_pinned == 1) {
			return
		}
	
		if((author == -210575018) || (author == 245517522) || (author == 156650173) || (author == 676524349) || (author == 425669044) || (author == 245517522) || (author == 679286896) || (author == 595130357)) {
			console.log("interesting post found")
			newPost = true
			postID = id
		}
	})

	if(!newPost) {
		return
	}

	await users.filter(user => user.token !== null).forEach(async (user) => {

		newPost = false

		const vk = await new VK({
			token: user.token
		})

		await vk.api.likes.add({
			type: 'post',
			owner_id: -210575018,
			item_id: postID
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
			if(error.includes("flood control")) {
				error = "flood control: "
			}

			console.log(error, user.name, user.surname)
		})

		console.log(user.name, user.surname, "liked")
	})		

}
