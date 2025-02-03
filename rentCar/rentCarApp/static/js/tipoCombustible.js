document.addEventListener("DOMContentLoaded", function () {
    // Función para CREAR una nueva tipoCombustible
    document.getElementById('guardartipoCombustible').addEventListener('click', function () {
        const descripcion = document.getElementById('descripcion').value.trim();
        const estado = document.getElementById('estado').value;

        if (!descripcion) {
            mostrarToast('warning', 'La descripción es obligatoria.');
            return;
        }

        fetch('/api/tipoCombustible/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': '{{ csrf_token }}'
            },
            body: JSON.stringify({
                descripcion: descripcion,
                estado: parseInt(estado)
            })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error al guardar la tipoCombustible.');
                }
            })
            .then(data => {
                mostrarToast('success', data.message || 'tipoCombustible agregada exitosamente.');
                document.getElementById("creartipoCombustibleForm").reset(); // Limpiar formulario

                // Ocultar modal después de éxito
                const modal = bootstrap.Modal.getInstance(document.getElementById('creartipoCombustibleModal'));
                modal.hide();

                setTimeout(() => location.reload(), 1000); // Recargar después de 1s
            })
            .catch(error => {
                mostrarToast('danger', error.message);
            });
    });

    // Función para manejar la EDICIÓN de una tipoCombustible
    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            const descripcion = this.dataset.descripcion;
            const estado = this.dataset.estado;

            // Llenar el modal con los datos actuales
            document.getElementById("editDescripcion").value = descripcion;
            document.getElementById("editEstado").value = estado;
            document.getElementById("editartipoCombustible").dataset.id = id;

            // Mostrar el modal de edición
            const modal = new bootstrap.Modal(document.getElementById("editartipoCombustibleModal"));
            modal.show();
        });
    });

    // Guardar cambios de la tipoCombustible editada
    document.getElementById("editartipoCombustible").addEventListener("click", function () {
        const id = this.dataset.id;
        const descripcion = document.getElementById("editDescripcion").value.trim();
        const estado = document.getElementById("editEstado").value;

        if (!descripcion) {
            mostrarToast('warning', 'La descripción es obligatoria.');
            return;
        }

        fetch(`/api/tipoCombustible/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": "{{ csrf_token }}"
            },
            body: JSON.stringify({
                descripcion: descripcion,
                estado: parseInt(estado) // Elimina parseInt, ya que Django espera un ID directamente
            })
        })

            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    mostrarToast('success', data.message);
                    setTimeout(() => location.reload(), 1000);
                } else {
                    mostrarToast('danger', 'Error al actualizar la tipoCombustible.');
                }
            })
            .catch(error => mostrarToast('danger', 'Error en la solicitud.'));
    });

    // Función para ELIMINAR una tipoCombustible
    document.querySelectorAll(".btn-eliminar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;

            // Guardar el ID en un atributo del botón "Eliminar"
            const confirmarBtn = document.getElementById("confirmarEliminar");
            confirmarBtn.dataset.id = id;

            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById("modalConfirmacion"));
            modal.show();

            // Manejar la confirmación de eliminación
            confirmarBtn.onclick = function () {
                fetch(`/api/tipoCombustible/${id}`, {
                    method: "DELETE",
                    headers: {
                        "X-CSRFToken": "{{ csrf_token }}"
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message) {
                            mostrarToast('success', data.message);
                            setTimeout(() => location.reload(), 1000);
                        } else {
                            mostrarToast('danger', 'Error al eliminar la tipoCombustible.');
                        }
                    })
                    .catch(error => mostrarToast('danger', 'Error en la solicitud.'));
            };
        });
    });
});

// Función para mostrar los toasts de notificación
function mostrarToast(tipo, mensaje) {
    const toastEl = document.getElementById(`toast${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    toastEl.querySelector('.toast-body').innerText = mensaje;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}