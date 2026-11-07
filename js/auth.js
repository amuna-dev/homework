// Общие настройки и функции для работы с токенами.
// Подключается и на login.html, и на profile.html.

const API_URL = 'https://dummyjson.com';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Задача 2: сохраняем оба токена в localStorage
function saveTokens(accessToken, refreshToken) {
  if (!accessToken || !refreshToken) {
    throw new Error('Сервер не вернул токены');
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Задача 4: удаляем токены при выходе или при 401
function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Пользователь считается вошедшим, если в localStorage есть access-токен
function isLoggedIn() {
  return Boolean(getAccessToken());
}
