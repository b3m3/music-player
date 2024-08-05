document.addEventListener('DOMContentLoaded', () => {
	const fileHandleMap = new Map()
	const musicList = document.querySelector('.playlist-list')
	const audioPlayer = document.querySelector('.audio-element')
	const albumArt = document.querySelector('.album-art')
	const playBtn = document.querySelector('.play-btn')
	const backBtn = document.querySelector('.back-btn')
	const nextBtn = document.querySelector('.next-btn')
	const seekBar = document.querySelector('.seek-bar')
	const currentTimeDisplay = document.querySelector('.current-time')
	const totalTimeDisplay = document.querySelector('.total-time')
	const currentTrackDisplay = document.querySelector('.current-track')
	const selectFilesBtn = document.querySelector('.select-files-btn');
	const themeBtn = document.querySelector('.theme-btn')

	let currentIndex = null
	let currentTrackName = ''

	const getMusicName = str => {
		return str.split('-')[str.split('-').length - 1].split('.')[0]
	}

	const getMusicExecutor = str => {
		return str.split('-')[0]
	}

	document.querySelector('.select-dir-btn').addEventListener('click', () => {
		selectFilesBtn.click()
	})

	selectFilesBtn.addEventListener('change', event => {
		const files = event.target.files
		if (files.length > 0) {
			musicList.innerHTML = ''
			fileHandleMap.clear()
			currentIndex = null // Reset current index when loading new files

			Array.from(files).forEach((file, index) => {
				if (file.name.endsWith('.mp3')) {
					const li = document.createElement('li')
					const p = document.createElement('p')
					const span = document.createElement('span')

					p.textContent = getMusicExecutor(file.name)
					span.textContent = getMusicName(file.name)

					li.append(p)
					li.append(span)
					li.dataset.index = index
					li.classList.add('music-item')
					li.addEventListener('click', playMusic)
					musicList.appendChild(li)
					fileHandleMap.set(index, file)
				}
			})
		}
	})

	async function playMusic(event) {
		const liElement = event.target.closest('li')
		if (!liElement) return

		const index = liElement.dataset.index
		currentIndex = parseInt(index)
		const file = fileHandleMap.get(currentIndex)

		try {
			const url = URL.createObjectURL(file)
			audioPlayer.src = url
			audioPlayer.play()

			// Обновление состояния кнопки Play/Pause
			playBtn.innerHTML = `
				<svg viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M10 6.42004C10 4.76319 8.65685 3.42004 7 3.42004C5.34315 3.42004 4 4.76319 4 6.42004V18.42C4 20.0769 5.34315 21.42 7 21.42C8.65685 21.42 10 20.0769 10 18.42V6.42004Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M20 6.42004C20 4.76319 18.6569 3.42004 17 3.42004C15.3431 3.42004 14 4.76319 14 6.42004V18.42C14 20.0769 15.3431 21.42 17 21.42C18.6569 21.42 20 20.0769 20 18.42V6.42004Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			`

			jsmediatags.read(file, {
				onSuccess: tag => {
					const picture = tag.tags.picture
					if (picture) {
						const base64String = arrayBufferToBase64(picture.data)
						albumArt.src = `data:${picture.format};base64,${base64String}`
						albumArt.style.display = 'block'
					} else {
						albumArt.src = './icons/mp3.svg';
					}
				},
				onError: error => {
					console.error('Error reading tags:', error)
					albumArt.src = './icons/mp3.svg'
				},
			})

			// Обновление информации о треке
			currentTrackName = file.name.split('.').shift();
			currentTrackDisplay.textContent = currentTrackName;

			// Update seek bar and total time
			audioPlayer.addEventListener('loadedmetadata', () => {
				seekBar.max = audioPlayer.duration
				totalTimeDisplay.textContent = formatTime(audioPlayer.duration)
			})

			audioPlayer.addEventListener('timeupdate', () => {
				seekBar.value = audioPlayer.currentTime
				currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime)
			})

			seekBar.addEventListener('input', () => {
				audioPlayer.currentTime = seekBar.value
			})

			updateActiveClass()
		} catch (err) {
			console.error('Error playing music file:', err)
			albumArt.src = './icons/mp3.svg'
		}
	}

	function arrayBufferToBase64(buffer) {
		let binary = ''
		const bytes = new Uint8Array(buffer)
		const len = bytes.byteLength
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i])
		}
		return window.btoa(binary)
	}

	function formatTime(seconds) {
		const minutes = Math.floor(seconds / 60)
		const secs = Math.floor(seconds % 60)
		return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
	}

	function updateActiveClass() {
		document.querySelectorAll('.music-item').forEach((item, index) => {
			item.classList.toggle('active', index === currentIndex)
		})
	}

	function checkStorageTheme() {


		if (localStorage.getItem('music-player-theme') === 'dark') {
			document.body.classList.add('dark');
			themeBtn.innerHTML = `
				<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V3C12.75 3.41421 12.4142 3.75 12 3.75C11.5858 3.75 11.25 3.41421 11.25 3V2C11.25 1.58579 11.5858 1.25 12 1.25ZM4.39861 4.39861C4.6915 4.10572 5.16638 4.10572 5.45927 4.39861L5.85211 4.79145C6.145 5.08434 6.145 5.55921 5.85211 5.85211C5.55921 6.145 5.08434 6.145 4.79145 5.85211L4.39861 5.45927C4.10572 5.16638 4.10572 4.6915 4.39861 4.39861ZM19.6011 4.39887C19.894 4.69176 19.894 5.16664 19.6011 5.45953L19.2083 5.85237C18.9154 6.14526 18.4405 6.14526 18.1476 5.85237C17.8547 5.55947 17.8547 5.0846 18.1476 4.79171L18.5405 4.39887C18.8334 4.10598 19.3082 4.10598 19.6011 4.39887ZM12 6.75C9.1005 6.75 6.75 9.1005 6.75 12C6.75 14.8995 9.1005 17.25 12 17.25C14.8995 17.25 17.25 14.8995 17.25 12C17.25 9.1005 14.8995 6.75 12 6.75ZM5.25 12C5.25 8.27208 8.27208 5.25 12 5.25C15.7279 5.25 18.75 8.27208 18.75 12C18.75 15.7279 15.7279 18.75 12 18.75C8.27208 18.75 5.25 15.7279 5.25 12ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H3C3.41421 11.25 3.75 11.5858 3.75 12C3.75 12.4142 3.41421 12.75 3 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM20.25 12C20.25 11.5858 20.5858 11.25 21 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H21C20.5858 12.75 20.25 12.4142 20.25 12ZM18.1476 18.1476C18.4405 17.8547 18.9154 17.8547 19.2083 18.1476L19.6011 18.5405C19.894 18.8334 19.894 19.3082 19.6011 19.6011C19.3082 19.894 18.8334 19.894 18.5405 19.6011L18.1476 19.2083C17.8547 18.9154 17.8547 18.4405 18.1476 18.1476ZM5.85211 18.1479C6.145 18.4408 6.145 18.9157 5.85211 19.2086L5.45927 19.6014C5.16638 19.8943 4.6915 19.8943 4.39861 19.6014C4.10572 19.3085 4.10572 18.8336 4.39861 18.5407L4.79145 18.1479C5.08434 17.855 5.55921 17.855 5.85211 18.1479ZM12 20.25C12.4142 20.25 12.75 20.5858 12.75 21V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V21C11.25 20.5858 11.5858 20.25 12 20.25Z" fill="#1C274C"/>
				</svg>
			`
		} else {
			document.body.classList.remove('dark');
			themeBtn.innerHTML = `
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447Z" fill="#1C274C"/>
			</svg>
			`
		}
	}

	function themeHandler() {
		if (localStorage.getItem('music-player-theme') === 'dark') {
			localStorage.setItem('music-player-theme', '');
		} else {
			localStorage.setItem('music-player-theme', 'dark');
		}

		checkStorageTheme();
	}

	checkStorageTheme();

	themeBtn.addEventListener('click', themeHandler);

	// Toggle play/pause on play button click
	playBtn.addEventListener('click', () => {
		if (fileHandleMap.size === 0) {
			return // Do nothing if there's no music
		}

		if (currentIndex === null) {
			// Play the first track if no track is currently selected
			playMusic({ target: musicList.querySelector('.music-item') })
		} else if (audioPlayer.paused) {
			audioPlayer.play()
			playBtn.innerHTML = `
				<svg viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M10 6.42004C10 4.76319 8.65685 3.42004 7 3.42004C5.34315 3.42004 4 4.76319 4 6.42004V18.42C4 20.0769 5.34315 21.42 7 21.42C8.65685 21.42 10 20.0769 10 18.42V6.42004Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M20 6.42004C20 4.76319 18.6569 3.42004 17 3.42004C15.3431 3.42004 14 4.76319 14 6.42004V18.42C14 20.0769 15.3431 21.42 17 21.42C18.6569 21.42 20 20.0769 20 18.42V6.42004Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			`
		} else {
			audioPlayer.pause()
			playBtn.innerHTML = `
				<svg viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M7.98047 3.51001C5.43047 4.39001 4.98047 9.09992 4.98047 12.4099C4.98047 15.7199 5.41047 20.4099 7.98047 21.3199C10.6905 22.2499 18.9805 16.1599 18.9805 12.4099C18.9805 8.65991 10.6905 2.58001 7.98047 3.51001Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			`
		}
	})

	// Play the next track
	nextBtn.addEventListener('click', () => {
		if (fileHandleMap.size > 0 && currentIndex !== null) {
			let nextIndex = currentIndex + 1
			if (nextIndex >= fileHandleMap.size) {
				nextIndex = 0 // Loop back to the first track if the end of the list is reached
			}
			playMusic({
				target: musicList.querySelector(`li[data-index="${nextIndex}"]`),
			})
		}
	})

	// Play the previous track
	backBtn.addEventListener('click', () => {
		if (fileHandleMap.size > 0 && currentIndex !== null) {
			let prevIndex = currentIndex - 1
			if (prevIndex < 0) {
				prevIndex = fileHandleMap.size - 1 // Loop back to the last track if the start of the list is reached
			}
			playMusic({
				target: musicList.querySelector(`li[data-index="${prevIndex}"]`),
			})
		}
	})

	// Add event listener to play the next track when the current one ends
	audioPlayer.addEventListener('ended', () => {
		nextBtn.click()
	})
})
