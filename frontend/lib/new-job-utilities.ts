import { JobMode } from "@/lib/api/createJob"
import { toast } from "sonner"

const DOMAINS=["www.reddit.com", "reddit.com"]
const SEARCHMODE=["top", "new", "rising", "best", "hot"]


export function notifyUser(message: string, success: boolean){
	const data =  {description: message, duration: 4000}
	if (success)
		toast.success("Success", data)
	else
		toast.error("Failed", data)
}

function checkInputUrl(target:string): string | null
{
	let path: string | null = null
	try {
		const url = new URL(target)
		const urlpath = url.pathname.split("/").filter(Boolean)
		if (url.protocol !== 'https:'
			|| !DOMAINS.includes(url.hostname)
			|| url.pathname[0] !== "/"
			|| urlpath.length !== 5
			|| urlpath[0] !== "r"
			|| urlpath[2] !== "comments")
		{
			notifyUser("Malformed post url", false)
			return null
		}
		path = urlpath.join("/")
	} catch {
		notifyUser("Invalid URL", false)
		return null
	}
	return path
}

function checkSubreddit(target: string): string | null
{
	let path: string | null = null
	try {
		const urlpath = target.split("/").filter(Boolean)
		if ((urlpath.length !== 2 && urlpath.length !== 3)
			|| urlpath[0] !== "r"
			|| (urlpath.length === 3 && !SEARCHMODE.includes(urlpath[2]))
		)
		{
			notifyUser("Malformed Subreddit", false)
			return null
		}
		if (urlpath.length === 2)
			urlpath.push("new")
		path = urlpath.join("/")
	} catch {
		notifyUser("Invalid URL", false)
		return null
	}
	return path
}

function checkUser(target: string): string | null
{
	let path: string | null = null
	try {
		const urlpath = target.split("/").filter(Boolean)
		if ((urlpath.length !== 2)
			|| urlpath[0] !== "user"
		)
		{
			notifyUser("Malformed User", false)
			return null
		}
		path = urlpath.join("/")
	} catch {
		notifyUser("Invalid URL", false)
		return null
	}
	return path
}

export function checkInput(target: string, mode: JobMode): string | null
{
	if (target === "")
	{
		notifyUser("Empty string", false)
		return null;
	}
	else if (mode === "post")
		return checkInputUrl(target)
	else if (mode === "subreddit")
		return checkSubreddit(target)
	else if (mode === "user")
		return checkUser(target)
	else
		return (target)
}