document.addEventListener("DOMContentLoaded", function () {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    function aplicarMascara(input, mascara) {
        input.addEventListener("input", function () {
            let valor = input.value.replace(/\D/g, ""); // Elimina todo lo que no sea número
            let resultado = "";
            let indice = 0;

            for (let char of mascara) {
                if (char === "#") {
                    if (indice < valor.length) {
                        resultado += valor[indice];
                        indice++;
                    } else {
                        break;
                    }
                } else {
                    resultado += char;
                }
            }
            input.value = resultado;
        });
    }

    // Aplica la máscara en los diferentes formularios (Crear y Editar Cliente)
    const cedulaInputs = document.querySelectorAll("#cedula, #editCedula");
    const tarjetaInputs = document.querySelectorAll("#no_tarjeta_cr, #editNoTarjetaCR");

    cedulaInputs.forEach(input => aplicarMascara(input, "###-#######-#"));
    tarjetaInputs.forEach(input => aplicarMascara(input, "####-####-####-####"));

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

    function manejarErrores(response, form) {
        response.json().then(data => {
            if (response.status === 400 && data.errors) {
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
                        feedback.textContent = data.errors[key][0];
                        feedback.style.display = "block";
                    }
                });
            }
        }).catch(error => mostrarToast("danger", "Error inesperado al procesar los datos."));
    }

    document.getElementById("guardarCliente").addEventListener("click", function () {
        const form = document.getElementById("crearClienteForm");
        if (!validarFormulario(form)) return;

        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => { jsonData[key] = value; });

        fetch("/api/cliente/", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrftoken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => {
            if (!response.ok) {
                manejarErrores(response, form);
                throw new Error("Error al crear cliente");
            }
            return response.json();
        })
        .then(data => {
            mostrarToast("success", "Cliente creado exitosamente.");
            setTimeout(() => location.reload(), 1000);
        })
        .catch(error => mostrarToast("danger", "Error al crear cliente"));
    });

    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            document.getElementById("editNombre").value = this.dataset.nombre;
            document.getElementById("editCedula").value = this.dataset.cedula;
            document.getElementById("editNoTarjetaCR").value = this.dataset.no_tarjeta_cr;
            document.getElementById("editLimiteCredito").value = this.dataset.limite_credito;
            document.getElementById("editTipoPersona").value = this.dataset.tipo_persona;
            document.getElementById("editEstado").value = this.dataset.estado;
            document.getElementById("editarCliente").dataset.id = id;
            new bootstrap.Modal(document.getElementById("editarClienteModal")).show();
        });
    });

    document.getElementById("editarCliente").addEventListener("click", function () {
        const form = document.getElementById("editarClienteForm");
        if (!validarFormulario(form)) return;

        const id = this.dataset.id;
        const jsonData = {
            nombre: document.getElementById("editNombre").value.trim(),
            cedula: document.getElementById("editCedula").value.trim(),
            no_tarjeta_cr: document.getElementById("editNoTarjetaCR").value.trim(),
            limite_credito: document.getElementById("editLimiteCredito").value,
            tipo_persona: document.getElementById("editTipoPersona").value,
            estado: document.getElementById("editEstado").value
        };

        fetch(`/api/cliente/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => {
            if (!response.ok) {
                manejarErrores(response, form);
                throw new Error("Error al actualizar cliente");
            }
            return response.json();
        })
        .then(data => {
            mostrarToast("success", "Cliente actualizado exitosamente.");
            setTimeout(() => location.reload(), 1000);
        })
        .catch(error => mostrarToast("danger", "Error al actualizar cliente"));
    });

    document.querySelectorAll(".btn-eliminar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            document.getElementById("confirmarEliminarCliente").addEventListener("click", function () {
                fetch(`/api/cliente/${id}`, {
                    method: "DELETE",
                    headers: { "X-CSRFToken": csrftoken }
                })
                .then(response => {
                    if (!response.ok) throw new Error("Error al eliminar cliente");
                    return response.json();
                })
                .then(data => {
                    mostrarToast("success", "Cliente eliminado exitosamente.");
                    setTimeout(() => location.reload(), 1000);
                })
                .catch(error => mostrarToast("danger", "Error al eliminar cliente"));
            });
            new bootstrap.Modal(document.getElementById("eliminarClienteModal")).show();
        });
    });
});

function mostrarToast(tipo, mensaje) {
    const toastEl = document.getElementById(`toast${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    toastEl.querySelector('.toast-body').innerText = mensaje;
    new bootstrap.Toast(toastEl).show();
}
