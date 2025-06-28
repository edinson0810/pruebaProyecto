import { loginUser } from '../../services/authService.js';
import { displayMessage } from '../../helpers/domHelpers.js';

export function setupLoginPageLogic(containerElement) {
  const loginForm = containerElement.querySelector('#loginForm');
  const emailInput = containerElement.querySelector('#email');
  const passwordInput = containerElement.querySelector('#password');
  const errorMessageElement = containerElement.querySelector('#errorMessage');
  const submitButton = loginForm.querySelector('button[type="submit"]');

  if (!loginForm) {
    console.error("LoginForm not found in containerElement. Make sure index.html (login) is loaded.");
    return;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    displayMessage('errorMessage', '', false); /

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      displayMessage('errorMessage', 'Por favor, rellena todos los campos.', true);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Iniciando sesión...';

    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userName', data.user.nombre);
      localStorage.setItem('userRole', data.user.rol_id);

      displayMessage('errorMessage', data.message || 'Inicio de sesión exitoso.', false);
      setTimeout(() => {
        window.router.navigate('/dashboard'); /
      }, 1500);
    } catch (error) {
      console.error('Error durante el login:', error);
      displayMessage('errorMessage', error.message || 'Error de login. Inténtalo de nuevo.', true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Iniciar Sesión';
    }
  });


  const registerLink = containerElement.querySelector('a[href="/register"]');
  if (registerLink) {
    registerLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.router.navigate('/register');
    });
  }


  const forgotPasswordLink = containerElement.querySelector('#forgotPasswordLink');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.router.navigate('/recuperar');
    });
  }
}

