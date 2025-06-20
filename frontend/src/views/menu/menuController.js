// controllers/menuController.js
export function setupMenuController(container) {

  const apiUrl = 'http://localhost:3000/api/menu';

  const form = container.querySelector('#menuForm');
  const nombre = container.querySelector('#nombre');
  const descripcion = container.querySelector('#descripcion');
  const precio = container.querySelector('#precio');
  const categoria = container.querySelector('#categoria');
  const tableBody = container.querySelector('#menuTable tbody');
  const resetBtn = container.querySelector('#resetBtn');
  const volverBtn = container.querySelector('#volverDashboardBtn');

  // Validar existencia antes de agregar eventos
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // lógica de guardado aquí
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
    });
  }

  if (volverBtn) {
    volverBtn.addEventListener('click', () => {
      window.router.navigate('/dashboard');
    });
  }

  const id = idField.value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${apiUrl}/${id}` : `${apiUrl}/register`;

  // cargar productos al iniciar
  cargarMenu();

  async function cargarMenu() {
    // lógica de cargar el menú desde backend
  }
}
