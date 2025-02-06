document.addEventListener("DOMContentLoaded", function () {
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
                document.getElementById("creartipoCombustibleForm").reset(); 

                const modal = bootstrap.Modal.getInstance(document.getElementById('creartipoCombustibleModal'));
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
            document.getElementById("editartipoCombustible").dataset.id = id;

            const modal = new bootstrap.Modal(document.getElementById("editartipoCombustibleModal"));
            modal.show();
        });
    });

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
                estado: parseInt(estado) 
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
                            mostrarToast('danger', 'Error al eliminar la tipoCombustible.');
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