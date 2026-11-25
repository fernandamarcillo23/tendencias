import React, { useState, useEffect } from 'react';

export default function App() {
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    pastel: 'Chocolate',
    tamano: 'Mediano (15 porciones)',
    mensaje: ''
  });

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  // Cargar pedidos guardados
  const cargarPedidos = async () => {
    try {
      const res = await fetch('/api/pedidos');
      if (res.ok) {
        const data = await res.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setNotificacion({
          tipo: 'success',
          titulo: '¡Pedido guardado con éxito!',
          mensaje: 'El pedido fue registrado en el sistema correctamente.',
          datos: data.data
        });

        // Limpiar campos
        setFormData({
          cliente: '',
          telefono: '',
          pastel: 'Chocolate',
          tamano: 'Mediano (15 porciones)',
          mensaje: ''
        });

        cargarPedidos();
      } else {
        setNotificacion({
          tipo: 'danger',
          titulo: 'Error',
          mensaje: data.error || 'No se pudo guardar el pedido.'
        });
      }
    } catch (error) {
      setNotificacion({
        tipo: 'danger',
        titulo: 'Error de Red',
        mensaje: 'No hay conexión con el servidor.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Barra superior de navegación en tono rosita */}
      <nav className="navbar navbar-dark bg-pink rounded shadow-sm px-4 mb-4">
        <span className="navbar-brand mb-0 h1 fs-4 fw-bold">Pastelería - Registro de Pedidos</span>
      </nav>

      <div className="row g-4">
        {/* Columna Izquierda: Formulario */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-pink text-white py-3">
              <h5 className="card-title mb-0 fw-semibold">Nuevo Pedido</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="cliente" className="form-label fw-semibold">
                    Nombre del Cliente:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="cliente"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                    placeholder="Ingrese nombre y apellido"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="telefono" className="form-label fw-semibold">
                    Teléfono de Contacto:
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej. 3001234567"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="pastel" className="form-label fw-semibold">
                    Sabor del Pastel:
                  </label>
                  <select
                    className="form-select"
                    id="pastel"
                    name="pastel"
                    value={formData.pastel}
                    onChange={handleChange}
                  >
                    <option value="Chocolate">Chocolate</option>
                    <option value="Vainilla">Vainilla</option>
                    <option value="Tres Leches">Tres Leches</option>
                    <option value="Red Velvet">Red Velvet</option>
                    <option value="Fresa">Fresa con Crema</option>
                    <option value="Zanahoria">Zanahoria</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="tamano" className="form-label fw-semibold">
                    Tamaño:
                  </label>
                  <select
                    className="form-select"
                    id="tamano"
                    name="tamano"
                    value={formData.tamano}
                    onChange={handleChange}
                  >
                    <option value="Pequeño (8 porciones)">Pequeño (8 porciones)</option>
                    <option value="Mediano (15 porciones)">Mediano (15 porciones)</option>
                    <option value="Grande (25 porciones)">Grande (25 porciones)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="mensaje" className="form-label fw-semibold">
                    Dedicatoria o Nota:
                  </label>
                  <textarea
                    className="form-control"
                    id="mensaje"
                    name="mensaje"
                    rows="3"
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Dedicatoria o detalles del pastel (opcional)"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-pink btn-lg w-100 shadow-sm text-white fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Pedido'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Notificaciones y Pedidos */}
        <div className="col-12 col-md-6">
          {/* Cajita de Alerta de Notificación al Guardar */}
          {notificacion && (
            <div className={`alert alert-${notificacion.tipo} alert-dismissible fade show shadow-sm mb-4`} role="alert">
              <h5 className="alert-heading fs-6 fw-bold mb-1">{notificacion.titulo}</h5>
              <p className="mb-2">{notificacion.mensaje}</p>
              {notificacion.datos && (
                <div className="small border-top pt-2">
                  <div><strong>Cliente:</strong> {notificacion.datos.cliente}</div>
                  <div><strong>Pastel:</strong> {notificacion.datos.pastel} - {notificacion.datos.tamano}</div>
                </div>
              )}
              <button
                type="button"
                className="btn-close"
                onClick={() => setNotificacion(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Tarjeta de Lista de Notificaciones de Pedidos */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0 text-pink fw-bold">Notificaciones de Pedidos</h5>
              <span className="badge bg-pink rounded-pill text-white">{pedidos.length} pedidos</span>
            </div>

            <div className="card-body p-0">
              {pedidos.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <p className="mb-0">No hay pedidos registrados todavía.</p>
                  <small>Completa el formulario para agregar el primero.</small>
                </div>
              ) : (
                <ul className="list-group list-group-flush" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                  {pedidos.map((item) => (
                    <li key={item.id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="mb-0 fw-bold text-pink">{item.pastel}</h6>
                        <span className="badge bg-light text-dark border">Pedido #{item.id}</span>
                      </div>
                      <p className="mb-1 text-secondary small">
                        <strong>Cliente:</strong> {item.cliente} | <strong>Teléfono:</strong> {item.telefono}
                      </p>
                      <p className="mb-1 text-secondary small">
                        <strong>Tamaño:</strong> {item.tamano}
                      </p>
                      {item.mensaje && item.mensaje !== 'Sin dedicatoria' && (
                        <p className="mb-1 small fst-italic text-muted">
                          <strong>Nota:</strong> "{item.mensaje}"
                        </p>
                      )}
                      <div className="text-end">
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {item.creado_en ? new Date(item.creado_en).toLocaleString('es-ES') : ''}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
