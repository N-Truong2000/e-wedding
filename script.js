document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openBtn');
    const weddingCover = document.getElementById('weddingCover');
    const weddingMusic = document.getElementById('weddingMusic');
    const rsvpForm = document.getElementById('rsvpForm');

    // 1. Xử lý mở thiệp & tự phát nhạc nền
    openBtn.addEventListener('click', () => {
        weddingCover.classList.add('opened');
        document.body.classList.add('content-show');

        if (weddingMusic) {
            weddingMusic.play().catch(err => {
                console.log("Trình duyệt hạn chế tự động phát nhạc khi chưa tương tác sâu hơn.", err);
            });
        }
    });
});