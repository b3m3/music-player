document.addEventListener('DOMContentLoaded', () => {
	const fileHandleMap = new Map()
	const musicList = document.querySelector('.music-list')
	const audioPlayer = document.querySelector('.audio-element')
	const albumArt = document.querySelector('.album-art')
	const playBtn = document.querySelector('.play-btn')
	const backBtn = document.querySelector('.back-btn')
	const nextBtn = document.querySelector('.next-btn')
	const seekBar = document.querySelector('.seek-bar')
	const currentTimeDisplay = document.querySelector('.current-time')
	const totalTimeDisplay = document.querySelector('.total-time')
	const currentTrackDisplay = document.querySelector('.current-track')

	let currentIndex = null
	let currentTrackName = ''

	const getMusicName = str => {
		return str.split('-')[str.split('-').length - 1].split('.')[0]
	}

	const getMusicExecutor = str => {
		return str.split('-')[0]
	}

	document
		.querySelector('.select-dir-btn')
		.addEventListener('click', async () => {
			if ('showDirectoryPicker' in window) {
				try {
					const dirHandle = await window.showDirectoryPicker()
					musicList.innerHTML = ''
					fileHandleMap.clear()
					currentIndex = null // Reset current index when loading new directory

					let index = 0
					for await (const entry of dirHandle.values()) {
						if (entry.kind === 'file' && entry.name.endsWith('.mp3')) {
							const li = document.createElement('li')
							const p = document.createElement('p')
							const span = document.createElement('span')

							p.textContent = getMusicExecutor(entry.name)
							span.textContent = getMusicName(entry.name)

							li.append(p)
							li.append(span)
							li.dataset.index = index
							li.classList.add('music-item')
							li.addEventListener('click', playMusic)
							musicList.appendChild(li)
							fileHandleMap.set(index, entry)
							index++
						}
					}
				} catch (err) {
					console.error('Error accessing directory:', err)
				}
			} else {
				alert('Your browser does not support the File System Access API')
			}
		})

	async function playMusic(event) {
		const index = event.target.dataset.index
		currentIndex = parseInt(index)
		const fileHandle = fileHandleMap.get(currentIndex)

		try {
			const file = await fileHandle.getFile()
			const url = URL.createObjectURL(file)
			audioPlayer.src = url
			audioPlayer.play()

			// Обновление состояния кнопки Play/Pause
			playBtn.querySelector('img').src = './icons/pause.svg'

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
					albumArt.src = './icons/mp3.svg';
				},
			})

			// Обновление информации о треке
			currentTrackName = file.name.split('.').shift();
			currentTrackDisplay.textContent = currentTrackName

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
			albumArt.src = './icons/mp3.svg';
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

	// Toggle play/pause on play button click
	playBtn.addEventListener('click', () => {
		if (fileHandleMap.size === 0) {
			return // Do nothing if there's no music
		}

		if (currentIndex === null) {
			// Play the first track if no track is currently selected
			playMusic({ target: { dataset: { index: 0 } } })
		} else if (audioPlayer.paused) {
			audioPlayer.play()
			playBtn.querySelector('img').src = './icons/pause.svg'
		} else {
			audioPlayer.pause()
			playBtn.querySelector('img').src = './icons/play.svg'
		}
	})

	// Play the next track
	nextBtn.addEventListener('click', () => {
		if (fileHandleMap.size > 0 && currentIndex !== null) {
			let nextIndex = currentIndex + 1
			if (nextIndex >= fileHandleMap.size) {
				nextIndex = 0 // Loop back to the first track if the end of the list is reached
			}
			playMusic({ target: { dataset: { index: nextIndex } } })
		}
	})

	// Play the previous track
	backBtn.addEventListener('click', () => {
		if (fileHandleMap.size > 0 && currentIndex !== null) {
			let prevIndex = currentIndex - 1
			if (prevIndex < 0) {
				prevIndex = fileHandleMap.size - 1 // Loop back to the last track if the start of the list is reached
			}
			playMusic({ target: { dataset: { index: prevIndex } } })
		}
	})

	// Add event listener to play the next track when the current one ends
	audioPlayer.addEventListener('ended', () => {
		nextBtn.click()
	})
})
