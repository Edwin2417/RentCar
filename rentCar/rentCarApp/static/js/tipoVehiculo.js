document.addEventListener("DOMContentLoaded", function () {

    function mostrarErrorCampo(input, mensaje) {
        input.classList.add("is-invalid");
        let errorDiv = input.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains("invalid-feedback")) {
            errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");
            input.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = mensaje;
    }

    function limpiarErrorCampo(campo) {
        let errorDiv = campo.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains("invalid-feedback")) {
            errorDiv.remove();
            campo.classList.remove("is-invalid");
        }
    }

    document.querySelectorAll("input, select").forEach(campo => {
        campo.addEventListener("input", function () {
            limpiarErrorCampo(this);
        });
    });

    document.getElementById('guardartipoVehiculo').addEventListener('click', function () {
        const descripcion = document.getElementById('descripcion');
        const estado = document.getElementById('estado');
        let valido = true;

        if (!descripcion.value.trim()) {
            mostrarErrorCampo(descripcion, "La descripción es obligatoria.");
            valido = false;
        }

        if (!estado.value.trim()) {
            mostrarErrorCampo(estado, "El estado es obligatorio.");
            valido = false;
        }

        if (!valido) return;

        fetch('/api/tipoVehiculo/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': '{{ csrf_token }}'
            },
            body: JSON.stringify({
                descripcion: descripcion.value.trim(),
                estado: parseInt(estado.value)
            })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error al guardar el tipo de vehículo.');
                }
            })
            .then(data => {
                mostrarToast('success', data.message || 'Tipo de vehículo agregado exitosamente.');
                document.getElementById("creartipoVehiculoForm").reset();

                const modal = bootstrap.Modal.getInstance(document.getElementById('creartipoVehiculoModal'));
                modal.hide();

                setTimeout(() => location.reload(), 1000);
            })
            .catch(error => {
                mostrarToast('danger', error.message);
            });
    });

    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            const descripcion = this.dataset.descripcion;
            const estado = this.dataset.estado;

            document.getElementById("editDescripcion").value = descripcion;
            document.getElementById("editEstado").value = estado;
            document.getElementById("editartipoVehiculo").dataset.id = id;

            const modal = new bootstrap.Modal(document.getElementById("editartipoVehiculoModal"));
            modal.show();
        });
    });

    document.getElementById("editartipoVehiculo").addEventListener("click", function () {
        const id = this.dataset.id;
        const descripcion = document.getElementById("editDescripcion");
        const estado = document.getElementById("editEstado");
        let valido = true;

        if (!descripcion.value.trim()) {
            mostrarErrorCampo(descripcion, "La descripción es obligatoria.");
            valido = false;
        }

        if (!estado.value.trim()) {
            mostrarErrorCampo(estado, "El estado es obligatorio.");
            valido = false;
        }

        if (!valido) return;

        fetch(`/api/tipoVehiculo/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": "{{ csrf_token }}"
            },
            body: JSON.stringify({
                descripcion: descripcion.value.trim(),
                estado: parseInt(estado.value)
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    mostrarToast('success', data.message);
                    setTimeout(() => location.reload(), 1000);
                } else {
                    mostrarToast('danger', 'Error al actualizar el tipo de vehículo.');
                }
            })
            .catch(error => mostrarToast('danger', 'Error en la solicitud.'));
    });

    document.querySelectorAll(".btn-eliminar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;

            const confirmarBtn = document.getElementById("confirmarEliminar");
            confirmarBtn.dataset.id = id;

            const modal = new bootstrap.Modal(document.getElementById("modalConfirmacion"));
            modal.show();

            confirmarBtn.onclick = function () {
                fetch(`/api/tipoVehiculo/${id}`, {
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
                            mostrarToast('danger', 'Error al eliminar el tipo de vehículo.');
                        }
                    })
                    .catch(error => mostrarToast('danger', 'Error en la solicitud.'));
            };
        });
    });
});

function mostrarToast(tipo, mensaje) {
    const toastEl = document.getElementById(`toast${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    toastEl.querySelector('.toast-body').innerText = mensaje;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}
