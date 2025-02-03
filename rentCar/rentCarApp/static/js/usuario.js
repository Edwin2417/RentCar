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

    document.getElementById("guardarUsuario").addEventListener("click", function () {
        const form = document.getElementById("crearUsuarioForm");
        if (!validarFormulario(form)) return;

        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => { jsonData[key] = value; });

        fetch("/api/usuario/", {
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
                    throw new Error("Error al crear usuario");
                }
                return response.json();
            })
            .then(data => {
                mostrarToast("success", "Usuario creado exitosamente.");
                setTimeout(() => location.reload(), 1000);
            })
            .catch(error => mostrarToast("danger", "Error al crear usuario"));
    });

    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            document.getElementById("editNombre").value = this.dataset.nombre_usuario;
            document.getElementById("editContrasena").value = this.dataset.contrasena;
            document.getElementById("editRoles").value = this.dataset.rol;
            document.getElementById("editEstado").value = this.dataset.estado;
            document.getElementById("editarUsuario").dataset.id = id;
            new bootstrap.Modal(document.getElementById("editarUsuarioModal")).show();
        });
    });

    document.getElementById("editarUsuario").addEventListener("click", function () {
        const form = document.getElementById("editarUsuarioForm");
        if (!validarFormulario(form)) return;

        const id = this.dataset.id;
        const jsonData = {
            nombre_usuario: document.getElementById("editNombre").value.trim(),
            contrasena: document.getElementById("editContrasena").value.trim(),
            rol: document.getElementById("editRoles").value,
            estado: document.getElementById("editEstado").value
        };

        fetch(`/api/usuario/${id}`, {
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
                    throw new Error("Error al actualizar usuario");
                }
                return response.json();
            })
            .then(data => {
                mostrarToast("success", "Usuario actualizado exitosamente.");
                setTimeout(() => location.reload(), 1000);
            })
            .catch(error => mostrarToast("danger", "Error al actualizar usuario"));
    });

    document.querySelectorAll(".btn-eliminar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            document.getElementById("confirmarEliminarUsuario").addEventListener("click", function () {
                fetch(`/api/usuario/${id}`, {
                    method: "DELETE",
                    headers: { "X-CSRFToken": csrftoken }
                })
                    .then(response => {
                        if (!response.ok) throw new Error("Error al eliminar usuario");
                        return response.json();
                    })
                    .then(data => {
                        mostrarToast("success", "Usuario eliminado exitosamente.");
                        setTimeout(() => location.reload(), 1000);
                    })
                    .catch(error => mostrarToast("danger", "Error al eliminar usuario"));
            });
            new bootstrap.Modal(document.getElementById("eliminarUsuarioModal")).show();
        });
    });
});

function mostrarToast(tipo, mensaje) {
    const toastEl = document.getElementById(`toast${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    toastEl.querySelector('.toast-body').innerText = mensaje;
    new bootstrap.Toast(toastEl).show();
}