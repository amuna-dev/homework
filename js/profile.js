// Задача 3: без токена профиль недоступен — перенаправляем на вход
if (!isLoggedIn()) {
  location.replace('login.html');
}

// После выхода кнопка «Назад» может показать страницу из кэша браузера — проверяем ещё раз
window.addEventListener('pageshow', (event) => {
  if (event.persisted && !isLoggedIn()) {
    location.replace('login.html');
  }
});

const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('profile-error');
const profileElement = document.getElementById('profile');
const avatarElement = document.getElementById('avatar');
const fullNameElement = document.getElementById('full-name');
const emailElement = document.getElementById('email');
const ageElement = document.getElementById('age');
const cityElement = document.getElementById('city');
const retryBtn = document.getElementById('retry-btn');
const logoutBtn = document.getElementById('logout-btn');

// Заглушка, если у пользователя нет фото или оно не загрузилось
const AVATAR_PLACEHOLDER = 'img/avatar-placeholder.svg';

// true после нажатия «Выйти»: ответы запросов, которые ещё в пути,
// уже не должны снова записать токены в localStorage
let isLoggingOut = false;

// Задача 4: выход — удаляем токены и возвращаемся на страницу входа
function logout() {
  isLoggingOut = true;
  clearTokens();
  location.replace('login.html');
}

// Задача 3: запрос профиля с токеном в заголовке Authorization: Bearer
function fetchMe() {
  const token = getAccessToken();
  return axios.get(API_URL + '/auth/me', {
    headers: { Authorization: 'Bearer ' + token },
  });
}

// Токен недействителен?
// По заданию это ответ 401 (нет токена, токен истёк — «Token Expired!»).
// Но если токен испорчен вручную, dummyjson часто отвечает не 401, а 500:
// «invalid signature», «invalid token», «jwt signature is required» или даже
// ошибка разбора JSON, если поменять символ в середине токена.
// Поэтому 500 от /auth/me тоже считаем ошибкой токена.
// Нет ответа вообще (нет интернета) — это не ошибка токена.
function isUnauthorized(error) {
  if (!error.response) {
    return false;
  }

  const status = error.response.status;
  return status === 401 || status === 500;
}

// Задача 5: пробуем получить новую пару токенов по refreshToken
async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await axios.post(API_URL + '/auth/refresh', { refreshToken });

    // Пока ждали ответ, пользователь нажал «Выйти» — новые токены не сохраняем
    if (isLoggingOut) {
      return false;
    }

    saveTokens(response.data.accessToken, response.data.refreshToken);
    return true;
  } catch (error) {
    return false;
  }
}

function showLoading() {
  loadingElement.hidden = false;
  errorElement.hidden = true;
  profileElement.hidden = true;
  retryBtn.hidden = true;
}

function showError(message) {
  loadingElement.hidden = true;
  profileElement.hidden = true;
  errorElement.textContent = message;
  errorElement.hidden = false;
  retryBtn.hidden = false;
}

// Задача 3: фото, имя и фамилия, email, возраст, город.
// Используем textContent, а не innerHTML, чтобы данные не исполнялись как HTML.
function renderProfile(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  avatarElement.src = user.image || AVATAR_PLACEHOLDER;
  avatarElement.alt = fullName ? 'Фото: ' + fullName : 'Фото пользователя';
  fullNameElement.textContent = fullName || '—';
  emailElement.textContent = user.email || '—';
  ageElement.textContent = user.age != null ? String(user.age) : '—';
  cityElement.textContent = (user.address && user.address.city) || '—';

  loadingElement.hidden = true;
  errorElement.hidden = true;
  retryBtn.hidden = true;
  profileElement.hidden = false;
}

async function loadProfile() {
  showLoading();

  try {
    let response;

    try {
      response = await fetchMe();
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }

      // Задача 5: при 401 сначала пробуем обновить токен
      const refreshed = await refreshTokens();
      if (!refreshed) {
        // Не получилось — выход на страницу входа
        logout();
        return;
      }

      // Получилось — повторяем запрос профиля уже с новым токеном
      response = await fetchMe();
    }

    renderProfile(response.data);
  } catch (error) {
    // Задача 4: 401 (в том числе после обновления токена) — выход
    if (isUnauthorized(error)) {
      logout();
      return;
    }

    showError('Не удалось загрузить профиль. Проверьте интернет и попробуйте ещё раз.');
  }
}

// Фото не загрузилось — показываем заглушку вместо «сломанной» картинки
avatarElement.addEventListener('error', () => {
  if (!avatarElement.src.endsWith(AVATAR_PLACEHOLDER)) {
    avatarElement.src = AVATAR_PLACEHOLDER;
  }
});

logoutBtn.addEventListener('click', logout);
retryBtn.addEventListener('click', loadProfile);

if (isLoggedIn()) {
  loadProfile();
}
