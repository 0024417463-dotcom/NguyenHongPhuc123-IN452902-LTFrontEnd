// Câu 2: lấy dữ liệu sự kiện từ API và hiển thị

const API_URL = 'http://localhost:4000';

// Hàm có sẵn: đổi giờ UTC sang giờ Việt Nam, vd "08:00 12/09/2026"
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

const SOLD_OUT = 'Hết chỗ';
const MSG = {
  loading: 'Đang tải…',
  empty: 'Không có sự kiện nào khớp từ khoá.',
  error: 'Không tải được dữ liệu, vui lòng thử lại.',
  found: (n) => `Tìm thấy ${n} sự kiện`,
};

const listEl = document.querySelector('#event-list');
const statusEl = document.querySelector('#status');
const formEl = document.querySelector('#search-form');
const keywordEl = document.querySelector('#keyword');

// Tạo phần tử, gán class/văn bản/thuộc tính (không dùng innerHTML)
const makeEl = (tag, { cls, text, attrs = {} } = {}, ...children) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  node.append(...children);
  return node;
};

// ---------- 2a ----------
const formatSeats = (event) => {
  const left = event.capacity - event.registeredCount;
  return left > 0 ? `Còn ${left}/${event.capacity} chỗ` : SOLD_OUT;
};

// ---------- 2b ----------
const buildCard = (event) => {
  const seatsText = formatSeats(event);
  const seatsContent = seatsText === SOLD_OUT
    ? makeEl('span', { cls: 'tag-full', text: SOLD_OUT })
    : seatsText;

  return makeEl('article', { cls: 'ev' },
    makeEl('img', {
      cls: 'ev-img',
      attrs: {
        src: 'img/event.svg',
        alt: `Minh hoạ sự kiện ${event.name}`,
        width: '320',
        height: '180',
      },
    }),
    makeEl('div', { cls: 'ev-body' },
      makeEl('h2', { cls: 'ev-name' },
        makeEl('a', {
          text: event.name,
          attrs: { href: `event-detail.html?id=${encodeURIComponent(event.id)}` },
        })),
      makeEl('p', { cls: 'ev-meta ev-when' },
        makeEl('time', { text: formatDateTime(event.startTime), attrs: { datetime: event.startTime } })),
      makeEl('p', { cls: 'ev-meta ev-where', text: event.location }),
      makeEl('p', { cls: 'ev-meta ev-seats' }, seatsContent),
    ));
};

const renderEvents = (events) => {
  listEl.replaceChildren(...events.map(buildCard));
};

// ---------- 2c ----------
const loadEvents = async (keyword = '') => {
  const query = new URLSearchParams({ pageSize: 50 });
  if (keyword) query.append('q', keyword);

  statusEl.textContent = MSG.loading;
  try {
    const res = await fetch(`${API_URL}/api/events?${query.toString()}`);
    if (!res.ok) throw new Error(`Máy chủ trả về ${res.status}`);

    const { items, totalCount } = await res.json();
    renderEvents(items);
    statusEl.textContent = items.length ? MSG.found(totalCount) : MSG.empty;
  } catch (err) {
    console.error(err);
    statusEl.textContent = MSG.error;
  }
};

formEl.addEventListener('submit', (event) => {
  event.preventDefault();
  loadEvents(keywordEl.value.trim());
});

loadEvents();
