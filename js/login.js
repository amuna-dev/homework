// Задача 2: если пользователь уже вошёл — сразу отправляем на профиль
if (isLoggedIn()) {
  location.replace('profile.html');
}

// Если страницу вернули кнопкой «Назад» из кэша браузера — проверяем ещё раз
window.addEventListener('pageshow', (event) => {
  if (event.persisted && isLoggedIn()) {
    location.replace('profile.html');
  }
});

const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const usernameError = document.getElementById('username-error');
const passwordError = document.getElementById('password-error');
const formError = document.getElementById('form-error');
const submitBtn = document.getElementById('submit-btn');

function setFieldError(input, errorElement, message) {
  errorElement.textContent = message;
  input.classList.toggle('invalid', Boolean(message));
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

// Задача 1: пустые поля — ошибка под полем
function validate() {
  let isValid = true;

  if (usernameInput.value.trim() === '') {
    setFieldError(usernameInput, usernameError, 'Введите логин');
    isValid = false;
  } else {
    setFieldError(usernameInput, usernameError, '');
  }

  if (passwordInput.value.trim() === '') {
    setFieldError(passwordInput, passwordError, 'Введите пароль');
    isValid = false;
  } else {
    setFieldError(passwordInput, passwordError, '');
  }

  return isValid;
}

// Задача 1: во время запроса кнопка заблокирована, текст «Вход...»
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Вход...' : 'Войти';
}

// Убираем ошибку, как только пользователь начал исправлять поле
usernameInput.addEventListener('input', () => {
  setFieldError(usernameInput, usernameError, '');
  showFormError('');
});

passwordInput.addEventListener('input', () => {
  setFieldError(passwordInput, passwordError, '');
  showFormError('');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  showFormError('');

  // Пустые поля — запрос не отправляется
  if (!validate()) {
    return;
  }

  setLoading(true);

  try {
    // Задача 1: POST /auth/login с { username, password }
    const response = await axios.post(API_URL + '/auth/login', {
      username: usernameInput.value.trim(),
      password: passwordInput.value,
    });

    // Задача 2: берём accessToken и refreshToken из ответа и сохраняем
    const { accessToken, refreshToken } = response.data;
    saveTokens(accessToken, refreshToken);

    // После успешного входа — на профиль
    location.replace('profile.html');
  } catch (error) {
    const status = error.response ? error.response.status : null;

    // dummyjson на неверные данные отвечает 400 { message: 'Invalid credentials' }
    if (status === 400 || status === 401) {
      showFormError('Неверный логин или пароль');
    } else {
      showFormError('Не удалось выполнить вход. Проверьте интернет и попробуйте ещё раз.');
    }

    setLoading(false);
  }
});
