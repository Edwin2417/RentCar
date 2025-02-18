document.addEventListener("DOMContentLoaded", function () {
    
    function filtrarVehiculosDisponibles() {
        fetch("/api/inspeccion/")
        .then(response => response.json())
        .then(data => {
            let vehiculosInpeccionados = [];
            data.forEach(inspeccion => {
                if (inspeccion.estado === 1) {
                    vehiculosInpeccionados.push(inspeccion.vehiculo);
                }
            });
               
            document.querySelectorAll("#vehiculo, #editVehiculo").forEach(select => {
                select.querySelectorAll("option").forEach(option => {
                    let idVehiculo = parseInt(option.value);
                    
                    if (vehiculosInpeccionados.includes(idVehiculo)) {
                        option.style.display = "none"; 
                    } else {
                        option.style.display = "block"; 
                    }
                });
            });
        })
        .catch(error => console.error("Error al cargar rentas:", error));
    }
    document.getElementById("crearInspeccionModal").addEventListener("show.bs.modal", filtrarVehiculosDisponibles);
    document.getElementById("editarInspeccionModal").addEventListener("show.bs.modal", filtrarVehiculosDisponibles);
    

    // function filtrarClientesDisponibles() {
    //     fetch("/api/inspeccion/")
    //         .then(response => response.json())
    //         .then(data => {
    //             const clientesInspeccionados = new Set(data.map(inspeccion => inspeccion.cliente));
    
    //             document.querySelectorAll("#cliente, #editCliente").forEach(select => {
    //                 Array.from(select.options).forEach(option => {
    //                     if (clientesInspeccionados.has(parseInt(option.value))) {
    //                         option.style.display = "none"; 
    //                     } else {
    //                         option.style.display = "block"; 
    //                     }
    //                 });
    //             });
    //         })
    //         .catch(error => console.error("Error al cargar inspecciones:", error));
    // }
    
    // document.getElementById("crearInspeccionModal").addEventListener("show.bs.modal", filtrarClientesDisponibles);
    // document.getElementById("editarInspeccionModal").addEventListener("show.bs.modal", filtrarClientesDisponibles);
    
    // function validarFecha(campo) {
    //     const fechaSeleccionada = new Date(campo.value);
    //     const fechaActual = new Date();
        
    //     // Ajustar la fecha actual para ignorar la hora y comparar solo la fecha
    //     fechaActual.setHours(0, 0, 0, 0);

    //     if (fechaSeleccionada < fechaActual) {
    //         mostrarErrorCampo(campo, "La fecha de inspección no puede ser anterior a hoy.");
    //         return false;
    //     }
    //     return true;
    // }

    function validarFormularioInspeccion(formulario) {
        let valido = true;
    
        const vehiculo = formulario.querySelector("#vehiculo, #editVehiculo");
        const cliente = formulario.querySelector("#cliente, #editCliente");
        const empleado_inspeccion = formulario.querySelector("#empleado, #editEmpleado");
        const fecha = formulario.querySelector("#fecha, #editFecha");
        const cantidad_combustible = formulario.querySelector("#cantidad_combustible, #editCantidadCombustible");
        const estado = formulario.querySelector("#estado, #editEstado");
    
        // Lista de campos a validar
        const campos = [vehiculo, cliente, empleado_inspeccion, fecha, cantidad_combustible, estado];
    
        // Validar cada campo
        campos.forEach(campo => {
            if (!campo.value.trim()) {
                mostrarErrorCampo(campo, "Este campo es obligatorio.");
                valido = false;
            } else {
                limpiarErrorCampo(campo); // Si el campo es válido, limpiamos el error
            }
        });
    
        return valido;
    }
    
    // Función para mostrar error en un campo
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
    
    // Función para limpiar el error si el campo es válido
    function limpiarErrorCampo(input) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
    
        let errorDiv = input.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains("invalid-feedback")) {
            errorDiv.textContent = "";
        }
    }

    function mostrarToast(tipo, mensaje) {
        const toastEl = document.getElementById(`toast${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
        toastEl.querySelector('.toast-body').innerText = mensaje;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
    
    // Agregar validación en tiempo real (cada vez que el usuario escribe)
    document.querySelectorAll("#formInspeccion input, #formInspeccion select").forEach(input => {
        input.addEventListener("input", () => {
            if (input.value.trim()) {
                limpiarErrorCampo(input);
            } else {
                mostrarErrorCampo(input, "Este campo es obligatorio.");
            }
        });
    });
    
    document.getElementById('guardarInspeccion').addEventListener('click', function () {
        const form = document.getElementById("crearInspeccionForm");
        if (!validarFormularioInspeccion(form)) return;
        const vehiculo = document.getElementById("vehiculo");
        const cliente = document.getElementById("cliente");
        const empleado_inspeccion = document.getElementById("empleado");
        const fecha = document.getElementById("fecha");
        const cantidad_combustible = document.getElementById("cantidad_combustible");
        const estado = document.getElementById("estado");
        let valido = true;

        [vehiculo, cliente, empleado_inspeccion, fecha, cantidad_combustible, estado].forEach(campo => {
            if (!campo.value.trim()) {
                mostrarErrorCampo(campo, "Este campo es obligatorio.");
                valido = false;
            }
        });

        if (!valido) return;

        const inspeccionData = {
            vehiculo: vehiculo.value,
            cliente: cliente.value,
            empleado_inspeccion: empleado_inspeccion.value,
            fecha: fecha.value,
            cantidad_combustible: cantidad_combustible.value,
            tiene_ralladuras: document.getElementById("ralladuras").checked,
            tiene_goma_respuesta: document.getElementById("goma_respuesta").checked,
            tiene_gato: document.getElementById("gato").checked,
            tiene_roturas_cristal: document.getElementById("roturas_cristal").checked,
            goma_delantera_izquierda: document.getElementById("goma_delantera_izquierda").checked,
            goma_delantera_derecha: document.getElementById("goma_delantera_derecha").checked,
            goma_trasera_izquierda: document.getElementById("goma_trasera_izquierda").checked,
            goma_trasera_derecha: document.getElementById("goma_trasera_derecha").checked,
            estado: estado.value
        };

        fetch('/api/inspeccion/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': form.querySelector("input[name=csrfmiddlewaretoken]").value
            },
            body: JSON.stringify(inspeccionData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                mostrarToast('success', data.message);
                form.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('crearInspeccionModal'));
                modal.hide();
                setTimeout(() => location.reload(), 1000);
            } else {
                mostrarToast('danger', data.error || 'Error al guardar la inspección.');
            }
        })
        .catch(error => mostrarToast('danger', 'Error en la solicitud.'));
    });

    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
    
            fetch(`/api/inspeccion/${id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Error al obtener los datos de la inspección.");
                    }
                    return response.json();
                })
                .then(data => {
                    document.getElementById("editId").value = id;
                    document.getElementById("editVehiculo").value = data.vehiculo;
                    document.getElementById("editCliente").value = data.cliente;
                    document.getElementById("editEmpleado").value = data.empleado_inspeccion;
                    document.getElementById("editFecha").value = data.fecha;
                    document.getElementById("editCantidadCombustible").value = data.cantidad_combustible;
                    document.getElementById("editEstado").value = data.estado;
    
                    const selectEstado = document.getElementById("editEstado");
    
                    if (String(data.estado).toLowerCase() === "inactivo" || String(data.estado) === "2") {
                        selectEstado.disabled = true;
                    } else {
                        selectEstado.disabled = false;
                    }

                    document.querySelectorAll("#editarInspeccionModal input[type=checkbox]").forEach(checkbox => {
                        const prop = checkbox.getAttribute("data-prop"); 
                        if (prop && data.hasOwnProperty(prop)) {
                            checkbox.checked = Boolean(data[prop]); 
                        }
                    });
    
                    new bootstrap.Modal(document.getElementById("editarInspeccionModal")).show();
                })
                .catch(error => {
                    mostrarToast("danger", "Error al cargar la inspección.");
                    console.error("Error:", error);
                });
        });
    });
    
    
    document.getElementById("guardarCambiosInspeccion").addEventListener("click", function () {
        const id = document.getElementById("editId").value;
        

        const inspeccionData = {
            vehiculo: document.getElementById("editVehiculo").value,
            cliente: document.getElementById("editCliente").value,
            empleado_inspeccion: document.getElementById("editEmpleado").value,
            fecha: document.getElementById("editFecha").value,
            cantidad_combustible: document.getElementById("editCantidadCombustible").value,
            estado: document.getElementById("editEstado").value
        };
    
        document.querySelectorAll("#editarInspeccionModal input[type=checkbox]").forEach(checkbox => {
            const prop = checkbox.getAttribute("data-prop");
            if (prop) {
                inspeccionData[prop] = checkbox.checked; 
            }
        });
    
        fetch(`/api/inspeccion/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("input[name=csrfmiddlewaretoken]").value
            },
            body: JSON.stringify(inspeccionData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al actualizar la inspección.");
            }
            return response.json();
        })
        .then(data => {
            mostrarToast("success", "Inspección actualizada correctamente.");
            setTimeout(() => location.reload(), 1000);
        })
        .catch(error => {
            mostrarToast("danger", "Error al actualizar la inspección.");
            console.error("Error:", error);
        });
    });
    
    

    document.querySelectorAll(".btn-eliminar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            document.getElementById("deleteId").value = id;
            new bootstrap.Modal(document.getElementById("eliminarInspeccionModal")).show();
        });
    });

    document.getElementById("confirmarEliminarInspeccion").addEventListener("click", function () {
        const id = document.getElementById("deleteId").value; 

        if (!id) {
            mostrarToast("danger", "Error: No se pudo obtener el ID de la inspección.");
            return;
        }

        fetch(`/api/inspeccion/${id}`, {
            method: "DELETE",
            headers: { 
                "X-CSRFToken": document.querySelector("input[name=csrfmiddlewaretoken]").value
            }
        })
        .then(response => {
            if (!response.ok) throw new Error("Error al eliminar inspección");
            return response.json();
        })
        .then(data => {
            mostrarToast("success", "Inspección eliminada exitosamente.");
            setTimeout(() => location.reload(), 1000);
        })
        .catch(error => mostrarToast("danger", "Error al eliminar la inspección."));
    });
});
