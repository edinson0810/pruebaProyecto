

export async function ProcesamientoPagosPage(containerElement) {
  if (!containerElement) {
    console.error("No se proporcionó un elemento contenedor para ProcesamientoPagosPage.");
    return;
  }

  try {
    // 1. Cargar el HTML del panel de pagos

    const response = await fetch('/src/views/pagos/index.html');
    if (!response.ok) {
      throw new Error('No se pudo cargar la vista del panel de pagos.');
    }
    const html = await response.text();
    containerElement.innerHTML = html;

    // 2. Importar y ejecutar el controlador de pagos
    const { setupPagoController } = await import('/src/views/pagos/pagoController.js');
    setupPagoController();

  } catch (error) {
    console.error('Error al cargar el Panel de Procesamiento de Pagos:', error);
    containerElement.innerHTML = `<p class="error-message">Error al cargar la página del panel de pagos.</p>`;
  }
}
