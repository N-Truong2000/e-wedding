document.addEventListener('DOMContentLoaded', () => {
    // Ngăn chặn trình duyệt ghi nhớ vị trí cuộn cũ khi tải lại trang
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });

    const openBtn = document.getElementById('openBtn');
    const weddingCover = document.getElementById('weddingCover');
    const weddingMusic = document.getElementById('weddingMusic');

    // 1. Xử lý mở thiệp & tự phát nhạc nền
    if (openBtn && weddingCover) {
        openBtn.addEventListener('click', () => {
            // Đảm bảo cuộn về đầu trang ngay lập tức trước khi mở nội dung
            window.scrollTo({ top: 0, behavior: 'instant' });

            weddingCover.classList.add('opened');
            document.body.classList.add('content-show');

            // Cuộn đầu trang một lần nữa sau khi body đã có thanh cuộn để chắc chắn 100%
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                // Kích hoạt reveal cho các phần tử đầu tiên hiển thị ngay
                initScrollReveal();
            }, 50);

            if (weddingMusic) {
                weddingMusic.play().catch(err => {
                    console.log("Trình duyệt hạn chế tự động phát nhạc khi chưa tương tác sâu hơn.", err);
                });
            }
        });
    }

    // 2. Khởi tạo hiệu ứng hạt trôi nổi 3D
    init3DParticles();

    // 3. Khởi tạo bộ đếm ngược ngày cưới 3D
    init3DCountdown();

    // 4. Khởi tạo hiệu ứng nghiêng 3D (Tilt Effect)
    init3DTilt();

    // 5. Khởi tạo hiệu ứng xuất hiện khi cuộn trang (Scroll Reveal)
    initScrollReveal();
});

// --- HIỆU ỨNG HẠT TRÔI NỔI 3D (HEARTS, PETALS & SPARKLES) ---
function init3DParticles() {
    const canvas = document.getElementById('particles3d');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const maxParticles = 35; // Tối ưu hiệu năng cho thiết bị di động

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : -20;
            this.z = Math.random() * 0.8 + 0.2; // Độ sâu 3D (0.2: xa nhất, 1.0: gần nhất)
            this.size = (Math.random() * 7 + 4) * this.z; // Kích thước tỷ lệ với độ sâu
            this.speedX = (Math.random() * 1.0 - 0.5) * this.z; // Tốc độ bay ngang tỷ lệ theo độ sâu
            this.speedY = (Math.random() * 0.8 + 0.5) * this.z; // Tốc độ rơi tỷ lệ theo độ sâu
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() * 0.02 - 0.01) * this.z;
            this.opacity = (Math.random() * 0.35 + 0.4) * (this.z * 0.8 + 0.2); // Gần thì rõ, xa thì mờ

            // Thể loại hạt: 0 = Trái tim, 1 = Cánh hoa, 2 = Hạt lấp lánh gold
            this.type = Math.floor(Math.random() * 3);

            if (this.type === 0) {
                // Trái tim màu hồng phấn hoặc vàng gold
                this.color = Math.random() > 0.4 ? `rgba(212, 175, 55, ${this.opacity})` : `rgba(255, 120, 150, ${this.opacity})`;
            } else if (this.type === 1) {
                // Cánh hoa hồng bay
                this.color = `rgba(255, 180, 190, ${this.opacity})`;
            } else {
                // Lấp lánh gold
                this.color = `rgba(212, 175, 55, ${this.opacity})`;
            }
        }

        update() {
            this.x += this.speedX + Math.sin(this.y / 40) * 0.15; // Lắc lư nhẹ nhàng theo hình sin
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;

            // Reset nếu rơi quá màn hình hoặc bay lệch biên
            if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
                this.reset(false);
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;

            if (this.type === 0) {
                // Vẽ hình trái tim
                ctx.beginPath();
                const d = this.size;
                ctx.moveTo(0, -d / 4);
                ctx.bezierCurveTo(-d / 2, -d, -d, -d / 3, 0, d * 0.7);
                ctx.bezierCurveTo(d, -d / 3, d / 2, -d, 0, -d / 4);
                ctx.closePath();
                ctx.fill();
            } else if (this.type === 1) {
                // Vẽ cánh hoa (hình elip)
                ctx.beginPath();
                ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            } else {
                // Vẽ hạt lấp lánh gold (4 cánh nhọn)
                ctx.beginPath();
                const s = this.size * 0.7;
                ctx.moveTo(0, -s);
                ctx.quadraticCurveTo(0, 0, s, 0);
                ctx.quadraticCurveTo(0, 0, 0, s);
                ctx.quadraticCurveTo(0, 0, -s, 0);
                ctx.quadraticCurveTo(0, 0, 0, -s);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}

// --- BỘ ĐẾM NGƯỢC NGÀY CƯỚI 3D (3D COUNTDOWN TIMER) ---
function init3DCountdown() {
    // Ngày cưới: 19/07/2026 lúc 18:00
    const weddingDate = new Date('2026-07-19T18:00:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    function updateCountdown() {
        const now = new Date().getTime();
        const diff = weddingDate - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minsEl.textContent = '00';
            secsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const dStr = days < 10 ? '0' + days : days;
        const hStr = hours < 10 ? '0' + hours : hours;
        const mStr = minutes < 10 ? '0' + minutes : minutes;
        const sStr = seconds < 10 ? '0' + seconds : seconds;

        // Chỉ chạy hiệu ứng lật 3D khi giá trị số thay đổi
        if (daysEl.textContent !== String(dStr)) {
            animateCard(daysEl.parentElement, dStr);
        }
        if (hoursEl.textContent !== String(hStr)) {
            animateCard(hoursEl.parentElement, hStr);
        }
        if (minsEl.textContent !== String(mStr)) {
            animateCard(minsEl.parentElement, mStr);
        }
        if (secsEl.textContent !== String(sStr)) {
            animateCard(secsEl.parentElement, sStr);
        }
    }

    function animateCard(card, newValue) {
        const textEl = card.querySelector('.card-3d-face');
        card.style.transform = 'rotateX(360deg)';

        // Khi quay được nửa vòng (mặt úp), thay đổi số hiển thị và reset góc quay về 0
        setTimeout(() => {
            textEl.textContent = newValue;
            card.style.transition = 'none';
            card.style.transform = 'rotateX(0deg)';
            card.offsetHeight; // Kích hoạt reflow của trình duyệt
            card.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.6s ease';
        }, 300);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// --- HIỆU ỨNG TILT 3D KHI DI CHUỘT / CHẠM VUỐT ---
function init3DTilt() {
    const tiltContainers = [
        { element: document.getElementById('countdown3D'), intensity: 15 },
        { element: document.getElementById('heroDateBadge'), intensity: 12 },
        { element: document.querySelector('.cover-content'), intensity: 10 }
    ];

    tiltContainers.forEach(({ element, intensity }) => {
        if (!element) return;

        // Xử lý bù dịch chuyển translate(-50%, -50%) và translateZ(80px) cho phần tử được căn giữa tuyệt đối
        const isCentered = element.classList.contains('cover-content');
        const baseTranslate = isCentered ? 'translate(-50%, -50%) translateZ(80px) ' : '';

        element.style.transition = 'transform 0.5s ease';

        function handleMove(clientX, clientY) {
            const rect = element.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            const px = Math.max(0, Math.min(1, x / rect.width)) - 0.5;
            const py = Math.max(0, Math.min(1, y / rect.height)) - 0.5;

            const rotX = -py * intensity;
            const rotY = px * intensity;

            element.style.transition = 'transform 0.1s ease';
            element.style.transform = `${baseTranslate}perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`;
        }

        // Đảm bảo sau khi nhấc chuột, phần tử trở về trạng thái thẳng đứng ban đầu
        function handleLeave() {
            element.style.transition = 'transform 0.5s ease';
            element.style.transform = `${baseTranslate}perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }

        element.addEventListener('mousemove', (e) => {
            handleMove(e.clientX, e.clientY);
        });

        element.addEventListener('mouseleave', handleLeave);

        element.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
            }
        }, { passive: true });

        element.addEventListener('touchend', handleLeave);
    });
}

// --- HIỆU ỨNG XUẤT HIỆN KHI CUỘN TRANG (SCROLL REVEAL) ---
function initScrollReveal() {
    const reveals = document.querySelectorAll('.scroll-reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Chỉ chạy hoạt ảnh 1 lần duy nhất
            }
        });
    }, {
        threshold: 0.12, // Kích hoạt khi 12% phần tử hiển thị trong viewport
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(el => observer.observe(el));
}