
import { setupDashboardLogic } from '../views/dashboard/dashboardController.js';


const DASHBOARD_HTML_PATH = '/src/views/dashboard/index.html';

export async function DashboardPage(containerElement) {

  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No hay token de autenticación. Redirigiendo a /login.');
    window.router.navigate('/login');
    return;
  }

  try {

    const response = await fetch(DASHBOARD_HTML_PATH);
    if (!response.ok) {
      throw new Error(`No se pudo cargar la plantilla HTML del Dashboard: ${response.statusText} (${response.status})`);
    }
    const htmlContent = await response.text();


    containerElement.innerHTML = htmlContent;


    setupDashboardLogic(containerElement);

  } catch (error) {
    console.error('Error al cargar o renderizar DashboardPage:', error);

    containerElement.innerHTML = `<p class="error-message">Error al cargar la página del Dashboard: ${error.message}</p>`;
  }
}