
const API_BASE_URL = 'http://localhost:3000/api';


let pedidoForm;
let pedidoIdInput;
let usuarioInput;
let mesaSelect;
let observacionesTextarea;
let itemsContainer;
let addItemBtn;
let guardarPedidoBtn;
let limpiarFormularioBtn;
let volverDashboardBtn;
let totalPedidoSpan;

let menuOptions = [];


export const setupPedidoController = () => {

  pedidoForm = document.getElementById('pedidoForm');
  pedidoIdInput = document.getElementById('pedidoId');
  usuarioInput = document.getElementById('usuario');
  mesaSelect = document.getElementById('mesa');
  observacionesTextarea = document.getElementById('observaciones');
  itemsContainer = document.getElementById('itemsContainer');
  addItemBtn = document.getElementById('addItemBtn');
  guardarPedidoBtn = document.getElementById('guardarPedidoBtn');
  limpiarFormularioBtn = document.getElementById('limpiarFormularioBtn');
  volverDashboardBtn = document.getElementById('volverDashboardBtn');
  totalPedidoSpan = document.getElementById('totalPedido');


  if (pedidoForm) pedidoForm.addEventListener('submit', handleSavePedido);
  if (addItemBtn) addItemBtn.addEventListener('click', addItemRow);
  if (itemsContainer) {
    itemsContainer.addEventListener('click', handleRemoveItem);
    itemsContainer.addEventListener('change', (event) => {
      if (event.target.classList.contains('cantidadItem') || event.target.classList.contains('menuItem')) {
        updateTotal();
      }
    });
  }
  if (limpiarFormularioBtn) limpiarFormularioBtn.addEventListener('click', clearForm);


  if (volverDashboardBtn) {
    volverDashboardBtn.addEventListener('click', () => {
      window.router.navigate('/dashboard');
    });
  }


  loadMenuOptions();
  addItemRow();
  clearForm();
  updateTotal();
};


export const teardown = () => {

  if (pedidoForm) pedidoForm.removeEventListener('submit', handleSavePedido);
  if (addItemBtn) addItemBtn.removeEventListener('click', addItemRow);
  if (itemsContainer) {
    itemsContainer.removeEventListener('click', handleRemoveItem);

  }
  if (limpiarFormularioBtn) limpiarFormularioBtn.removeEventListener('click', clearForm);
  if (volverDashboardBtn) {

    const clonedBtn = volverDashboardBtn.cloneNode(true);
    volverDashboardBtn.parentNode.replaceChild(clonedBtn, volverDashboardBtn);
    volverDashboardBtn = clonedBtn;
  }
};



async function fetchMenu() {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`);
    if (!response.ok) {
      throw new Error(`No se pudo cargar el menú: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener el menú:', error);
    alert('Error al cargar el menú: ' + error.message);
    return [];
  }
}

async function loadMenuOptions() {
  menuOptions = await fetchMenu();
  document.querySelectorAll('.menuItem').forEach(select => {
    populateMenuItemSelect(select);
  });
}

function populateMenuItemSelect(selectElement) {
  selectElement.innerHTML = '<option value="">Seleccione un producto</option>';
  menuOptions.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = `${item.nombre} - $${parseFloat(item.precio).toFixed(2)} - ID:${item.id}`;
    selectElement.appendChild(option);
  });
    /
  selectElement.removeEventListener('change', updatePriceField);
  selectElement.addEventListener('change', updatePriceField);
}

function updateTotal() {
  let currentTotal = 0;
  if (!itemsContainer) {
    console.warn("itemsContainer es null en updateTotal. No se puede calcular el total.");
    return;
  }
  const itemRows = itemsContainer.querySelectorAll('.item-row');

  itemRows.forEach(row => {
    const cantidadInput = row.querySelector('.cantidadItem');
    const precioInput = row.querySelector('.precioUnitarioItem');

    const cantidad = parseFloat(cantidadInput.value) || 0;
    const precioUnitario = parseFloat(precioInput.value) || 0;

    currentTotal += (cantidad * precioUnitario);
  });

  if (totalPedidoSpan) {
    totalPedidoSpan.textContent = currentTotal.toFixed(2);
  } else {
    console.warn("Elemento con ID 'totalPedido' no encontrado en el DOM para actualizar. Este es el motivo del error 'Cannot read properties of null'.");
  }
}

function updatePriceField(event) {
  const selectElement = event.target;
  const itemRow = selectElement.closest('.item-row');
  const precioInput = itemRow.querySelector('.precioUnitarioItem');
  const selectedMenuItem = menuOptions.find(item => item.id == selectElement.value);

  if (selectedMenuItem) {
    precioInput.value = parseFloat(selectedMenuItem.precio).toFixed(2);
  } else {
    precioInput.value = '';
  }
  updateTotal();
}

async function handleSavePedido(event) {
  event.preventDefault();


  if (!usuarioInput || !mesaSelect || !observacionesTextarea || !itemsContainer || !totalPedidoSpan) {
    alert("Error interno: No se pudieron encontrar todos los elementos del formulario. Revise el HTML y los IDs.");
    console.error("Faltan elementos del DOM. Usuario:", usuarioInput, "Mesa:", mesaSelect, "Observaciones:", observacionesTextarea, "Items:", itemsContainer, "Total:", totalPedidoSpan);
    return;
  }

  const usuario_id = parseInt(usuarioInput.value);
  const mesa_id = parseInt(mesaSelect.value);
  const observaciones = observacionesTextarea.value.trim();
  const estado = 'pendiente';

  const items = [];
  const itemRows = itemsContainer.querySelectorAll('.item-row');
  let hasError = false;

  if (itemRows.length === 0) {
    alert('Un pedido debe tener al menos un producto.');
    return;
  }

  itemRows.forEach(row => {
    const menuId = row.querySelector('.menuItem').value;
    const cantidad = row.querySelector('.cantidadItem').value;
    const precioUnitario = row.querySelector('.precioUnitarioItem').value;

    if (!menuId || !cantidad || !precioUnitario || isNaN(parseInt(cantidad)) || isNaN(parseFloat(precioUnitario))) {
      hasError = true;
      alert('Por favor, complete todos los campos de los productos con valores válidos.');
      return;
    }

    items.push({
      menu_id: parseInt(menuId),
      cantidad: parseInt(cantidad),
      precio_unitario: parseFloat(precioUnitario)
    });
  });

  if (hasError) return;

  updateTotal();
  const totalPedido = parseFloat(totalPedidoSpan.textContent);

  const pedidoData = {
    usuario_id,
    mesa_id,
    estado,
    observaciones,
    items,
    total: totalPedido
  };

  // console.log('Enviando nuevo pedido:', pedidoData);

  try {
    const url = `${API_BASE_URL}/pedidos`;
    const method = 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedidoData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error del backend al guardar el pedido:', errorData);
      throw new Error(errorData.message || 'Error al guardar el pedido');
    }

    const result = await response.json();
    alert(result.message);
    clearForm();

    // *** CAMBIO CLAVE AQUÍ: Usar window.router.navigate ***
    // if (window.router && typeof window.router.navigate === 'function') {
    //     window.router.navigate('/cocina');
    // } else {
    //     console.error("window.router.navigate no está definido. ¿Está el enrutador cargado correctamente?");
    //     // Fallback si el router no funciona (recargar página completa)
    //     window.location.href = '/cocina';
    // }

  } catch (error) {
    console.error('Error en el frontend al guardar el pedido:', error);
    alert(`Error al guardar el pedido: ${error.message}`);
  }
}

let itemIndexCounter = 0;

function addItemRow(detail = null) {
  if (!itemsContainer) {
    console.error("itemsContainer es null. No se puede añadir fila de item.");
    return;
  }
  const currentItemIndex = itemIndexCounter++;

  const itemRow = document.createElement('div');
  itemRow.classList.add('item-row', 'row', 'g-2', 'align-items-center', 'mb-3');
  itemRow.dataset.itemIndex = currentItemIndex;

  itemRow.innerHTML = `
        <div class="col-md-5 col-sm-12">
            <select class="form-select menuItem" id="menuItem${currentItemIndex}" data-index="${currentItemIndex}" required></select>
        </div>
        <div class="col-md-2 col-sm-4 col-4">
            <input type="number" class="form-control cantidadItem" id="cantidadItem${currentItemIndex}" data-index="${currentItemIndex}" value="${detail ? detail.cantidad : 1}" min="1" required>
        </div>
        <div class="col-md-3 col-sm-5 col-5 d-flex align-items-center">
            <input type="text" class="form-control me-2 precioUnitarioItem" id="precioUnitarioItem${currentItemIndex}" data-index="${currentItemIndex}" readonly placeholder="Precio">
            <button type="button" class="removeItemBtn btn btn-sm btn-outline-danger">X</button>
        </div>
    `;
  itemsContainer.appendChild(itemRow);

  const newMenuItemSelect = itemRow.querySelector(`#menuItem${currentItemIndex}`);
  populateMenuItemSelect(newMenuItemSelect);
  newMenuItemSelect.addEventListener('change', updatePriceField); /


  const precioInput = itemRow.querySelector(`#precioUnitarioItem${currentItemIndex}`);
  if (detail && detail.precio_unitario) {
    precioInput.value = parseFloat(detail.precio_unitario).toFixed(2);
  } else {
    precioInput.value = '';
  }
  updateTotal();
}

function handleRemoveItem(event) {
  if (event.target.classList.contains('removeItemBtn')) {
    const itemRow = event.target.closest('.item-row');
    if (itemRow) {
      itemRow.remove();
      if (itemsContainer && itemsContainer.querySelectorAll('.item-row').length === 0) {
        addItemRow();
      }
      updateTotal();
    }
  }
}

function clearForm() {
  if (pedidoForm) pedidoForm.reset();
  if (pedidoIdInput) pedidoIdInput.value = '';
  if (observacionesTextarea) observacionesTextarea.value = '';
  if (itemsContainer) itemsContainer.innerHTML = '';
  itemIndexCounter = 0;
  addItemRow();
  if (usuarioInput) usuarioInput.focus();
  updateTotal();
}