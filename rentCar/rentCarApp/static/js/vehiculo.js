document.addEventListener("DOMContentLoaded", function () {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    function validarFormulario(form) {
        let valido = true;
        const campos = form.querySelectorAll("[required]");

        campos.forEach(campo => {
            let feedback = campo.nextElementSibling;

            if (!feedback || !feedback.classList.contains("invalid-feedback")) {
                feedback = document.createElement("div");
                feedback.classList.add("invalid-feedback");
                campo.parentNode.appendChild(feedback);
            }

            if (!campo.value.trim()) {
                campo.classList.add("is-invalid");
                campo.classList.remove("is-valid");
                feedback.textContent = `El campo ${campo.dataset.nombre} es obligatorio.`;
                feedback.style.display = "block";
                valido = false;
            } else {
                campo.classList.remove("is-invalid");
                campo.classList.add("is-valid");
                feedback.textContent = "";
                feedback.style.display = "none";
            }
        });

        return valido;
    }

    function manejarErroresDuplicados(response, form) {
        response.json().then(data => {
            console.log("Respuesta del backend:", data);

            if (response.status === 400) {
                if (data.errors) {
                    Object.keys(data.errors).forEach(key => {
                        const campo = form.querySelector(`[name=${key}]`);
                        if (campo) {
                            campo.classList.add("is-invalid");
                            let feedback = campo.nextElementSibling;

                            if (!feedback || !feedback.classList.contains("invalid-feedback")) {
                                feedback = document.createElement("div");
                                feedback.classList.add("invalid-feedback");
                                campo.parentNode.appendChild(feedback);
                            }

                            const errorMensaje = data.errors[key][0];
                            feedback.textContent = errorMensaje;
                            feedback.style.display = "block";
                        }
                    });
                }
            }
        }).catch(error => {
            console.error("Error procesando los datos:", error);
            mostrarToast("danger", "Error inesperado al procesar los datos.");
        });
    }

    document.getElementById("guardarVehiculo").addEventListener("click", function () {
        const form = document.getElementById("crearVehiculoForm");
        if (!validarFormulario(form)) return;

        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => { jsonData[key] = value; });

        fetch("/api/vehiculo/", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrftoken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonData)
        })
            .then(response => {
                if (!response.ok) {
                    manejarErroresDuplicados(response, form);
                    throw new Error("Error en la creación del vehículo.");
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    mostrarToast("success", "Vehículo creado exitosamente.");
                    setTimeout(() => location.reload(), 1000);
                }
            })
            .catch(error => mostrarToast("danger", "Error al crear el vehículo."));
    });

    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", function () {
            this.classList.remove("is-invalid");
            let feedback = this.nextElementSibling;
            if (feedback && feedback.classList.contains("invalid-feedback")) {
                feedback.style.display = "none";
            }
        });
    });

    // Función para manejar la EDICIÓN de un vehículo
    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            document.getElementById("editDescripcion").value = this.dataset.descripcion;
            document.getElementById("editNoChasis").value = this.dataset.no_chasis;
            document.getElementById("editNoMotor").value = this.dataset.no_motor;
            document.getElementById("editNoPlaca").value = this.dataset.no_placa;
            document.getElementById("editTipoVehiculo").value = this.dataset.tipo_vehiculo;
            document.getElementById("editMarca").value = this.dataset.marca;
            document.getElementById("editModelo").value = this.dataset.modelo;
            document.getElementById("editTipoCombustible").value = this.dataset.tipo_combustible;
            document.getElementById("editEstado").value = this.dataset.estado;
            document.getElementById("editarVehiculo").dataset.id = id;

            const modal = new bootstrap.Modal(document.getElementById("editarVehiculoModal"));
            modal.show();
        });
    });

    // Guardar cambios del vehículo editado
    document.getElementById("editarVehiculo").addEventListener("click", function () {
        const form = document.getElementById("editarVehiculoForm");
        if (!validarFormulario(form)) return;

        const id = this.dataset.id;
        const jsonData = {
            descripcion: document.getElementById("editDescripcion").value.trim(),
            no_chasis: document.getElementById("editNoChasis").value.trim(),
            no_motor: document.getElementById("editNoMotor").value.trim(),
            no_placa: document.getElementById("editNoPlaca").value.trim(),
            tipo_vehiculo: document.getElementById("editTipoVehiculo").value,
            marca: document.getElementById("editMarca").value,
            modelo: document.getElementById("editModelo").value,
            tipo_combustible: document.getElementById("editTipoCombustible").value,
            estado: document.getElementById("editEstado").value
        };

        fetch(`/api/vehiculo/${id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify(jsonData)
        })
            .then(response => {
                if (!response.ok) {
                    manejarErroresDuplicados(response, form);  // Maneja los errores del backend
                    throw new Error("Error en la actualización del vehículo.");
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    mostrarToast("success", "Vehículo actualizado exitosamente.");
                    setTimeout(() => location.reload(), 1000);
                }
            })
            .catch(error => mostrarToast("danger", "Error al actualizar el vehículo."));
    });

    // Función para ELIMINAR un vehículo
    document.querySelectorAll(".btn-eliminar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            const confirmarBtn = document.getElementById("confirmarEliminarVehiculo");
            document.getElementById("deleteId").value = id;

            confirmarBtn.replaceWith(confirmarBtn.cloneNode(true));
            const nuevoConfirmarBtn = document.getElementById("confirmarEliminarVehiculo");

            const modal = new bootstrap.Modal(document.getElementById("eliminarVehiculoModal"));
            modal.show();

            nuevoConfirmarBtn.addEventListener("click", function () {
                fetch(`/api/vehiculo/${id}/`, {
                    method: "DELETE",
                    headers: { "X-CSRFToken": csrftoken }
                })
                    .then(response => {
                        if (!response.ok) throw new Error("Error en la eliminación");
                        return response.json();
                    })
                    .then(data => {
                        mostrarToast("success", "Vehículo eliminado exitosamente.");
                        setTimeout(() => location.reload(), 1000);
                    })
                    .catch(error => mostrarToast("danger", "Error al eliminar el vehículo."));
            });
        });
    });
});

// Función para mostrar un toast
function mostrarToast(tipo, mensaje) {
    const toastEl = document.getElementById(`toast${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    toastEl.querySelector('.toast-body').innerText = mensaje;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}
