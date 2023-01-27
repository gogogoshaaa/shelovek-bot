import { VK, getRandomId } from 'vk-io'
import VKCaptchaSolver from 'vk-captchasolver'
import { setTimeout } from 'timers/promises'

import users from "./data/like-data.json" assert { type: 'json' }


console.log("posts monitoring started...")

let checkPostsInterval = setInterval(checkPosts, 5000)

const myvk = await new VK({
	token: "vk1.a.TBSoI_yoMh02ispZPdSG2xIrIYIiRbckRgEggrZAkrnxawJP2nGai3JAGz12G3VP5xNBzMYbjxwhFDi1wCGfTXDngCo6vpAbOf286JsRDBEetMSt_BSXFn5EmHo4lI9grswm2H9qn_6Xq8xyDHl-3WNuxBJtBNJ0PmClzr95TgbMmN4z5p2mXI1u3fCES-mHKDG47taMzsJPkkwIG-bhKA"
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

			console.log(error, user.name, user.surname)
		})

		console.log(user.name, user.surname, "liked")
	})		

}
