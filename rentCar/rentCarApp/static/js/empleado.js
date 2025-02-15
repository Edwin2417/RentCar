document.addEventListener("DOMContentLoaded", function () {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    function filtrarUsuariosDisponibles() {
        fetch("/api/empleado/")
        .then(response => response.json())
        .then(data => {
            let UsuariosAsignados = [];
            data.forEach(empleado => {
                if (empleado.estado === 1) {
                    UsuariosAsignados.push(empleado.usuario);
                }
            });
               
            document.querySelectorAll("#usuario, #editUsuario").forEach(select => {
                select.querySelectorAll("option").forEach(option => {
                    let idUsuario = parseInt(option.value);
                    
                    if (UsuariosAsignados.includes(idUsuario)) {
                        option.style.display = "none"; 
                    } else {
                        option.style.display = "block"; 
                    }
                });
            });
        })
        .catch(error => console.error("Error al cargar rentas:", error));
    }
    
    document.getElementById("crearEmpleadoModal").addEventListener("show.bs.modal", filtrarUsuariosDisponibles);
    document.getElementById("editarEmpleadoModal").addEventListener("show.bs.modal", filtrarUsuariosDisponibles);
     

    function setFormattedDate(inputId, dateValue) {
        if (dateValue) {
            let date = new Date(dateValue);
            let formattedDate = date.toISOString().split('T')[0]; 
            document.getElementById(inputId).value = formattedDate;
        }
    }

    function aplicarMascara(input, mascara) {
        input.addEventListener("input", function () {
            let valor = input.value.replace(/\D/g, "");
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

    const cedulaInputs = document.querySelectorAll("#cedula, #editCedula");
    cedulaInputs.forEach(input => aplicarMascara(input, "###-#######-#"));

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

    document.getElementById("guardarEmpleado").addEventListener("click", function () {
        const form = document.getElementById("crearEmpleadoForm");
        if (!validarFormulario(form)) return;

        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => { jsonData[key] = value; });

        fetch("/api/empleado/", {
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
                throw new Error("Error al crear empleado");
            }
            return response.json();
        })
        .then(data => {
            mostrarToast("success", "Empleado creado exitosamente.");
            setTimeout(() => location.reload(), 1000);
        })
        .catch(error => mostrarToast("danger", "Error al crear empleado"));
    });

    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            document.getElementById("editNombre").value = this.dataset.nombre;
            document.getElementById("editCedula").value = this.dataset.cedula;
            document.getElementById("editTanda").value = this.dataset.tanda_labor;
            document.getElementById("editPorciento").value = this.dataset.porciento_comision;
            setFormattedDate("editFecha", this.dataset.fecha_ingreso);
            document.getElementById("editUsuario").value = this.dataset.usuario;
            document.getElementById("editEstado").value = this.dataset.estado;
            document.getElementById("editarEmpleado").dataset.id = id;
            new bootstrap.Modal(document.getElementById("editarEmpleadoModal")).show();
        });
    });

    document.getElementById("editarEmpleado").addEventListener("click", function () {
        const form = document.getElementById("editarEmpleadoForm");
        if (!validarFormulario(form)) return;

        const id = this.dataset.id;
        const jsonData = {
            nombre: document.getElementById("editNombre").value.trim(),
            cedula: document.getElementById("editCedula").value.trim(),
            tanda_labor: document.getElementById("editTanda").value.trim(),
            porciento_comision: document.getElementById("editPorciento").value,
            fecha_ingreso: document.getElementById("editFecha").value,
            usuario: document.getElementById("editUsuario").value,
            estado: document.getElementById("editEstado").value
        };

        fetch(`/api/empleado/${id}`, {
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
                throw new Error("Error al actualizar empleado");
            }
            return response.json();
        })
        .then(data => {
            mostrarToast("success", "Empleado actualizado exitosamente.");
            setTimeout(() => location.reload(), 1000);
        })
        .catch(error => mostrarToast("danger", "Error al actualizar empleado"));
    });

    document.querySelectorAll(".btn-eliminar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            document.getElementById("confirmarEliminarEmpleado").addEventListener("click", function () {
                fetch(`/api/empleado/${id}`, {
                    method: "DELETE",
                    headers: { "X-CSRFToken": csrftoken }
                })
                .then(response => {
                    if (!response.ok) throw new Error("Error al eliminar empleado");
                    return response.json();
                })
                .then(data => {
                    mostrarToast("success", "Empleado eliminado exitosamente.");
                    setTimeout(() => location.reload(), 1000);
                })
                .catch(error => mostrarToast("danger", "Error al eliminar empleado"));
            });
            new bootstrap.Modal(document.getElementById("eliminarEmpleadoModal")).show();
        });
    });
});

function mostrarToast(tipo, mensaje) {
    const toastEl = document.getElementById(`toast${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    toastEl.querySelector('.toast-body').innerText = mensaje;
    new bootstrap.Toast(toastEl).show();
}