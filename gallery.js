document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const items = Array.from(document.querySelectorAll('.gallery-item'));

    // 1. Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            items.forEach(item => {
                const match = filter === 'all' || item.dataset.category === filter;
                item.classList.toggle('hidden', !match);
            });
        });
    });

    // 2. Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxMedia = document.getElementById('lightbox-media');
    const lightboxTag = document.getElementById('lightbox-tag');
    const lightboxTitle = document.getElementById('lightbox-title');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    let currentIndex = 0;

    const visibleItems = () => items.filter(item => !item.classList.contains('hidden'));

    const renderMedia = (item) => {
        const type = item.dataset.type;
        const src = item.dataset.src;
        lightboxMedia.innerHTML = '';

        if (type === 'video') {
            const vid = document.createElement('video');
            vid.src = src;
            vid.controls = true;
            vid.autoplay = true;
            vid.loop = true;
            vid.playsInline = true;
            lightboxMedia.appendChild(vid);
        } else {
            const img = document.createElement('img');
            img.src = src;
            img.alt = item.dataset.title;
            lightboxMedia.appendChild(img);
        }

        lightboxTag.textContent = item.dataset.tag;
        lightboxTitle.textContent = item.dataset.title;
    };

    const openLightbox = (item) => {
        const list = visibleItems();
        currentIndex = list.indexOf(item);
        renderMedia(item);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        lightboxMedia.innerHTML = '';
        document.body.style.overflow = '';
    };

    const showByOffset = (offset) => {
        const list = visibleItems();
        if (list.length === 0) return;
        currentIndex = (currentIndex + offset + list.length) % list.length;
        renderMedia(list[currentIndex]);
    };

    items.forEach(item => {
        item.addEventListener('click', () => openLightbox(item));
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => showByOffset(-1));
    nextBtn.addEventListener('click', () => showByOffset(1));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showByOffset(-1);
        if (e.key === 'ArrowRight') showByOffset(1);
    });

    // 3. Autoplay the muted preview videos once ready (matches homepage video behavior)
    document.querySelectorAll('.gallery-item video').forEach(vid => {
        vid.play().catch(() => {});
    });
});
