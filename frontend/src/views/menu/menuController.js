

export function setupMenuController(container) {
  const apiUrl = 'http://localhost:3000/api/menu';
  const token = localStorage.getItem('token');


  const form = container.querySelector('#menuForm');
  const idField = container.querySelector('#menuId');
  const nombreInput = container.querySelector('#nombre');
  const descripcionInput = container.querySelector('#descripcion');
  const precioInput = container.querySelector('#precio');
  const categoriaSelect = container.querySelector('#categoria');
  const tableBody = container.querySelector('#menuTable tbody');
  const resetBtn = container.querySelector('#resetBtn');
  const volverBtn = container.querySelector('#volverDashboardBtn');


  cargarMenu();


  if (volverBtn) {
    volverBtn.addEventListener('click', () => {
      window.router.navigate('/dashboard');
    });
  }


  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      idField.value = '';
    });
  }


  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const platillo = {
        nombre: nombreInput.value,
        descripcion: descripcionInput.value,
        precio: parseFloat(precioInput.value),
        categoria: categoriaSelect.value
      };


      if (!platillo.nombre || !platillo.precio) {
        alert('Nombre y precio son obligatorios.');
        return;
      }
      if (isNaN(platillo.precio)) {
        alert('El precio debe ser un número válido.');
        return;
      }
      if (!platillo.categoria) {
        alert('La categoría es obligatoria.');
        return;
      }


      const id = idField.value;
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${apiUrl}/${id}` : apiUrl;

      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(platillo)
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Error desconocido al procesar la solicitud.');
        }

        alert(data.message || 'Operación realizada correctamente');
        form.reset();
        idField.value = '';
        cargarMenu();
      } catch (err) {
        console.error('Error en la operación del menú:', err);
        alert('Error: ' + err.message);
      }
    });
  }


  async function cargarMenu() {
    tableBody.innerHTML = ''; /
    try {
      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const platos = await res.json();

      if (!res.ok) {
        throw new Error(platos.message || 'Error al obtener el menú.');
      }

      if (platos.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay productos en el menú.</td></tr>';
        return;
      }

      platos.forEach(plato => {
        const row = document.createElement('tr');

        const precioMostrado = plato.precio ? parseFloat(plato.precio).toFixed(2) : '0.00';
        row.innerHTML = `
                    <td data-label="Nombre">${plato.nombre || 'N/A'}</td>
                    <td data-label="Descripción">${plato.descripcion || 'N/A'}</td>
                    <td data-label="Precio">$${precioMostrado}</td>
                    <td data-label="Categoría">${plato.categoria_nombre || 'N/A'}</td> 
                    <td data-label="Acciones" class="action-buttons">
                        <button class="btn btn-primary editar-btn" data-id="${plato.id}">Editar</button>
                        <button class="btn btn-danger eliminar-btn" data-id="${plato.id}">Eliminar</button>
                    </td>
                `;
        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Error al cargar el menú:', err);
      alert('Error al cargar el menú: ' + err.message);
    }
  }

    /
  tableBody.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains('editar-btn')) {
      try {
        const res = await fetch(`${apiUrl}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const plato = await res.json();

        if (!res.ok) {
          throw new Error(plato.message || 'Error al obtener el platillo para edición.');
        }


        idField.value = plato.id;
        nombreInput.value = plato.nombre;
        descripcionInput.value = plato.descripcion;
        precioInput.value = plato.precio;

        categoriaSelect.value = plato.categoria_id;
      } catch (err) {
        console.error('Error al cargar el platillo para edición:', err);
        alert('Error al cargar el platillo: ' + err.message);
      }
    }

    if (e.target.classList.contains('eliminar-btn')) {
      if (!confirm('¿Estás seguro de que quieres eliminar este platillo? Esta acción no se puede deshacer.')) {
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Error al eliminar el platillo.');
        }

        alert(data.message);
        cargarMenu();
      } catch (err) {
        console.error('Error al eliminar el platillo:', err);
        alert('Error al eliminar: ' + err.message);
      }
    }
  });
}