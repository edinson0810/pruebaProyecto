
import { setupPedidoController } from '../views/pedidos/pedidosController.js';

/**
 * Función que representa la página de Gestión de Pedidos en un enrutador SPA.
 * Se encarga de cargar el HTML de la vista y luego inicializar su controlador.
 * @param {HTMLElement} containerElement - El elemento del DOM donde se cargará el contenido de la página (ej. un div#app).
 */
export async function GestionPedidosPage(containerElement) {

  try {
    // 1. Cargar el HTML de la vista de pedidos desde la ubicación correcta.

    const response = await fetch('/src/views/pedidos/index.html');
    if (!response.ok) {
      throw new Error(`No se pudo cargar la vista de pedidos. Estado: ${response.status}`);
    }
    const htmlContent = await response.text();
    containerElement.innerHTML = htmlContent; // Inserta el HTML cargado en el contenedor principal

    // 2. Ahora que el HTML está en el DOM, busca el contenedor específico de pedidos dentro de 'containerElement'.
    const pedidosViewContainer = containerElement.querySelector('#pedidos-view');

    if (pedidosViewContainer) {
      // 3. Inicializa el controlador de pedidos pasando el contenedor correcto.
      setupPedidoController(pedidosViewContainer);
    } else {
      console.error('ERROR: No se encontró el contenedor HTML con ID "pedidos-view" dentro del contenido cargado.');
      console.error('Asegúrate de que frontend/views/pedidos/index.html tiene un <div id="pedidos-view"> envolviendo todo el contenido de la UI.');
      containerElement.innerHTML = `<p class="alert alert-danger">Error: No se pudo cargar la vista de pedidos correctamente. Contenedor "pedidos-view" no encontrado.</p>`;
    }

  } catch (error) {
    console.error('Error al cargar la página de Gestión de Pedidos:', error);

    containerElement.innerHTML = `<p class="alert alert-danger">Error al cargar la página de Gestión de Pedidos: ${error.message}</p>`;
  }
}