/**
 * 1. Render songs
 * -> Lấy element chứa xong gán innerHTML = code render ra
 * -> Render là duyệt map qua mảng xong return template html rồi join nó lại
 * 2. Scroll top (kéo lên thì nhỏ ảnh cd lại) -> set new width của cái ảnh
 * giảm đi bằng đoạn scroll
 * 3. Play / pause / seek -> xong
 * 4. CD rotate -> xong
 * 5. Next / prev -> xong
 * 6. Random -> xong
 * 7. Next / Repeat when ended -> xong
 * 8. Active song -> xong
 * 9. Scroll active song into view -> xong
 * 10. Play song when click -> xong
 * 
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// key này để lấy ra biến config lưu trữ setting, biến này lưu object theo key-value
const PLAYER_STORAGE_KEY = 'Music-Player';

const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playlist = $('.playlist');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    currentTime: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,

    // Lưu các config vào storage cục bộ của trình duyệt
    // lưu dưới dạng chuỗi thôi
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    songs: [{
            name: 'How You Like That',
            singer: 'BLACKPINK',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.png'
        },
        {
            name: 'Dynamte',
            singer: 'BTS',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.png'
        },
        {
            name: 'After Like',
            singer: 'IVE',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.png'
        },
        {
            name: 'Cheer Up',
            singer: 'TWICE',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.png'
        },
        {
            name: 'Cupid',
            singer: 'Fifty Fifty',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.png'
        },
        {
            name: 'Love Dive',
            singer: 'IVE',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.png'
        },
        {
            name: 'Solo',
            singer: 'Jennie',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.png'
        },
        {
            name: 'Flower',
            singer: 'Jisoo',
            path: './assets/music/song8.mp3',
            image: './assets/img/song8.png'
        },
        {
            name: 'Darari',
            singer: 'Treasure',
            path: './assets/music/song9.mp3',
            image: './assets/img/song9.png'
        },
        {
            name: 'Gone',
            singer: 'Rosé',
            path: './assets/music/song10.mp3',
            image: './assets/img/song10.png'
        }
    ],

    fetchSong: function() {

    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index == this.currentIndex ? 'active' : ''}" data-index=${index}>
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        });
        playlist.innerHTML = htmls.join('');

    },
    // định nghĩa ra các thuộc tính
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            // getter
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lí CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })

        cdThumbAnimate.pause();

        // Xử lí phóng to / thu nhỏ CD
        document.onscroll = function() {
            // documentElement là element của thẻ html
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            // Kéo nhanh quá thì về âm
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lí khi click play
        playBtn.onclick = function() {

            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Khi song được play thì sự kiện onplay chạy
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song bị pause thì sự kiện onpause chạy
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
            _this.currentTime = audio.currentTime;
            _this.setConfig('currentTime', _this.currentTime);
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            // duration: thời lượng bài hát
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xử lí khi tua nhạc
        progress.onchange = function(e) {
            // e.target.value = progress.value
            const seekTime = audio.duration * e.target.value / 100;
            audio.currentTime = seekTime;
        }

        // Khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            // to fixed: remove active và chuyển active qua bài hát khác
            _this.scrollToActiveSong();
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            // to fixed: remove active và chuyển active qua bài hát khác
            _this.scrollToActiveSong();
        }

        // Xử lí bật / tắt random
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lí phát lại một bài hát
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lí next song khi audio ended
        audio.onended = function() {
            // Tự bấm nút next
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Lắng nghe hành vi click vào playlist
        // event delegation ủy thác sự kiện click các con vào thẻ cha của nó
        playlist.onclick = function(e) {
            // e.target trả về đúng thẻ con click vào (thẻ con trong song nữa)
            // .closet truy lên tìm thẻ cha (nếu ko có active thì mới lấy)
            const songNode = e.target.closest('.song:not(.active)');
            // note: selector:not(condition) -> chọn selector bỏ đi condition
            // Xử lí khi click vào song / nút option
            if (songNode || e.target.closest('.option')) {
                // Xử lí khi click vào song 
                if (songNode) {
                    // console.log(songNode.getAttribute('data-index'));
                    // console.log(songNode.dataset.index);

                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.resetTime();
                    _this.render();
                    audio.play();
                }

                // Xử lí khi click vào song option 
                if (e.target.closest('.option')) {

                }
            }
        }

    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            // to fixed: lỗi bài hát bị ẩn dưới position fixed
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                // block: 'nearest'
                block: 'center'
            });
        }, 300);
    },
    resetTime: function() {
        this.currentTime = 0;
        this.setConfig('currentTime', 0);
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
        this.setConfig('currentIndex', this.currentIndex);
        if (this.currentTime) {
            audio.currentTime = this.currentTime;
        }
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom || false;
        this.isRepeat = this.config.isRepeat || false;
        this.currentIndex = this.config.currentIndex ? this.config.currentIndex : 0;
        this.currentTime = this.config.currentTime ? this.config.currentTime : 0;
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        this.resetTime();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
        this.resetTime();
    },
    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.setConfig('currentIndex', this.currentIndex);
        this.resetTime();
        this.loadCurrentSong();
    },
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe / xử lí các sự kiện (DOM Events)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        // this.render();

        // Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
};

app.start()