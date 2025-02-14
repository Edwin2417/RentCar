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
            valido = false;
    }


    function limpiarErrorCampo(campo) {
        let errorSpan = campo.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains("error-message")) {
            errorSpan.remove();
        }
    }

    document.querySelectorAll("input, select").forEach(campo => {
        campo.addEventListener("input", function () {
            limpiarErrorCampo(this);
        });
    });

    document.getElementById('guardarMarca').addEventListener('click', function () {
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

        fetch('/api/marca/', {
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
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    mostrarToast('success', data.message);
                    document.getElementById("crearMarcaForm").reset(); 
                    const modal = bootstrap.Modal.getInstance(document.getElementById('crearMarcaModal'));
                    modal.hide();
                    setTimeout(() => location.reload(), 1000);
                } else {
                    mostrarToast('danger', 'Error al guardar la marca.');
                }
            })
            .catch(error => mostrarToast('danger', 'Error en la solicitud.'));
    });


    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            const descripcion = this.dataset.descripcion;
            const estado = this.dataset.estado;

            document.getElementById("editDescripcion").value = descripcion;
            document.getElementById("editEstado").value = estado;
            document.getElementById("editarMarca").dataset.id = id;

            const modal = new bootstrap.Modal(document.getElementById("editarMarcaModal"));
            modal.show();
        });
    });

    document.getElementById("editarMarca").addEventListener("click", function () {
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

        fetch(`/api/marca/${id}`, {
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
                    mostrarToast('danger', 'Error al actualizar la marca.');
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
                fetch(`/api/marca/${id}`, {
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
                            mostrarToast('danger', 'Error al eliminar la marca.');
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