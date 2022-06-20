const APP_ID = "f045b940d86743a5909f347100f5f577";

let uid = sessionStorage.getItem("uid")

if (!uid) {
    uid = String(Math.floor(Math.random() * 1000000))
    sessionStorage.setItem("uid", uid);
}
let TOKEN = null
let client;

//roomıd

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get("room");


if (!roomId) {
    window.location = "lobby.html"
}

let localTracks = []
let remoteUsers = {}

let joinRoomInıt = async () => {
    client = await AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
    await client.join(APP_ID, roomId, TOKEN)

    await client.on("user-published", handleUserPublished)
    await client.on("user-left", handleUserLeft)
    await joinStream()
}

let joinStream = async () => {
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    let player = `
    <div class="video_container" id="user-container-${uid}">
        <div class="video-player" id="user-${uid}"></div>
    </div > `

    document.getElementById("streams_container").insertAdjacentHTML("beforeend", player)
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)
    await localTracks[1].play(`user-${uid}`)
    // localTracks[0].play(`user-${uid}`)
    await client.publish([localTracks[0], localTracks[1]])
}

let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user

    await client.subscribe(user, mediaType)

    console.log(user.uid)
    let player = document.getElementById(`user-${user.uid}`)
    if (!player) {
        player = `
        <div class="video_container" id="user-container-${user.uid}">
        <div class="video-player" id="user-${user.uid}"></div>
        </div > `
        document.getElementById("streams_container").insertAdjacentHTML("beforeend", player)
        document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame)
    }

    if (displayFrame.style.display) {
        let videoFrame = document.getElementById(`user-container-${user.uid}`)
        videoFrame.style.height = '100px'
        videoFrame.style.width = '100px'
    }

    if (mediaType === "video") {
        await user.videoTrack.play(`user-${user.uid}`)
    }
    if (mediaType === "audio") {
        await user.audioTrack.play(`user-${user.uid}`)
    }
}
let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()

    if (userIdInDisplayFrame === `user-container-${user.uid}`) {
        displayFrame.style.display = null

        let videoFrames = document.getElementsByClassName('video_container')
        for (let i = 0; videoFrames.length > i; i++) {
            videoFrames[i].style.height = '300px'
            videoFrames[i].style.width = '300px'
        }
    }
}


joinRoomInıt()