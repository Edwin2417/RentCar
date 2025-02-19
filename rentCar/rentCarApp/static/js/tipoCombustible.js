document.addEventListener("DOMContentLoaded", function () {
    function mostrarErrorCampo(input, mensaje) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");

        let errorDiv = input.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains("invalid-feedback")) {
            errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");
            input.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = mensaje;
    }

    function limpiarErrorCampo(input) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");

        let errorDiv = input.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains("invalid-feedback")) {
            errorDiv.textContent = "";
        }
    }

    document.querySelectorAll("input, select").forEach(campo => {
        campo.addEventListener("input", function () {
            if (this.value.trim()) {
                limpiarErrorCampo(this);
            } else {
                mostrarErrorCampo(this, "Este campo es obligatorio.");
            }
        });
    });

    document.getElementById('guardartipoCombustible').addEventListener('click', function () {
        const descripcion = document.getElementById('descripcion');
        const estado = document.getElementById('estado');
        let valido = true;

        if (!descripcion.value.trim()) {
            mostrarErrorCampo(descripcion, "La descripción es obligatoria.");
            valido = false;
        } else {
            limpiarErrorCampo(descripcion);
        }

        if (!estado.value.trim()) {
            mostrarErrorCampo(estado, "El estado es obligatorio.");
            valido = false;
        } else {
            limpiarErrorCampo(estado);
        }

        if (!valido) return;

        fetch('/api/tipoCombustible/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': '{{ csrf_token }}'
            },
            body: JSON.stringify({
                descripcion: descripcion.value,
                estado: parseInt(estado.value)
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();  // Si la respuesta es correcta, la convertimos en JSON
            } else {
                throw new Error('Error al guardar el tipo de combustible.');  // Si no, lanzamos un error
            }
        })
        .then(data => {
            // Aquí, procesamos la respuesta convertida en JSON
            mostrarToast('success', data.message || 'Tipo de combustible agregado exitosamente.');
            document.getElementById("creartipoCombustibleForm").reset();
        
            const modal = bootstrap.Modal.getInstance(document.getElementById('creartipoCombustibleModal'));
            modal.hide();
        
            setTimeout(() => location.reload(), 1000);  // Recargamos la página después de un tiempo
        })
        .catch(error => {
            // Si algo falla, mostramos un mensaje de error
            mostrarToast('danger', error.message || 'Error inesperado al procesar los datos.');
        });
        
    });

    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            const descripcion = this.dataset.descripcion;
            const estado = this.dataset.estado;

            document.getElementById("editDescripcion").value = descripcion;
            document.getElementById("editEstado").value = estado;
            document.getElementById("editartipoCombustible").dataset.id = id;

            const modal = new bootstrap.Modal(document.getElementById("editartipoCombustibleModal"));
            modal.show();
        });
    });

    document.getElementById("editartipoCombustible").addEventListener("click", function () {
        const id = this.dataset.id;
        const descripcion = document.getElementById("editDescripcion");
        const estado = document.getElementById("editEstado");
        let valido = true;

        if (!descripcion.value.trim()) {
            mostrarErrorCampo(descripcion, "La descripción es obligatoria.");
            valido = false;
        } else {
            limpiarErrorCampo(descripcion);
        }

        if (!estado.value.trim()) {
            mostrarErrorCampo(estado, "El estado es obligatorio.");
            valido = false;
        } else {
            limpiarErrorCampo(estado);
        }

        if (!valido) return;

        fetch(`/api/tipoCombustible/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": "{{ csrf_token }}"
            },
            body: JSON.stringify({
                descripcion: descripcion.value,
                estado: parseInt(estado.value)
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                mostrarToast('success', data.message);
                setTimeout(() => location.reload(), 1000);
            } else {
                mostrarToast('danger', 'Error al actualizar el tipo de combustible.');
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
                        mostrarToast('danger', 'Error al eliminar el tipo de combustible.');
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
