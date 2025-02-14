document.addEventListener("DOMContentLoaded", function () {

    function calcularCantidadDias(fechaRentaInput, fechaDevolucionInput, cantidadDiasInput) {
        const fechaRenta = new Date(fechaRentaInput.value);
        const fechaDevolucion = new Date(fechaDevolucionInput.value);

        if (fechaRenta && fechaDevolucion && fechaDevolucion >= fechaRenta) {
            const diferenciaTiempo = fechaDevolucion - fechaRenta;
            const dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
            cantidadDiasInput.value = dias;
        } else {
            cantidadDiasInput.value = "";
        }
    }

    document.querySelectorAll("#fecha_renta, #editFechaRenta").forEach(input => {
        input.addEventListener("change", function () {
            const form = this.closest("form");
            const fechaRentaInput = form.querySelector("#fecha_renta, #editFechaRenta");
            const fechaDevolucionInput = form.querySelector("#fecha_devolucion, #editFechaDevolucion");
            const cantidadDiasInput = form.querySelector("#cantidad_dias, #editCantidadDias");

            calcularCantidadDias(fechaRentaInput, fechaDevolucionInput, cantidadDiasInput);
        });
    });

    document.querySelectorAll("#fecha_devolucion, #editFechaDevolucion").forEach(input => {
        input.addEventListener("change", function () {
            const form = this.closest("form");
            const fechaRentaInput = form.querySelector("#fecha_renta, #editFechaRenta");
            const fechaDevolucionInput = form.querySelector("#fecha_devolucion, #editFechaDevolucion");
            const cantidadDiasInput = form.querySelector("#cantidad_dias, #editCantidadDias");

            calcularCantidadDias(fechaRentaInput, fechaDevolucionInput, cantidadDiasInput);
        });
    });

    function filtrarVehiculosDisponibles() {
        fetch("/api/rentaDevolucion/")
            .then(response => response.json())
            .then(data => {
                const vehiculosRentados = new Set(data.map(renta => renta.vehiculo));
    
                document.querySelectorAll("#vehiculo, #editVehiculo").forEach(select => {
                    Array.from(select.options).forEach(option => {
                        if (vehiculosRentados.has(parseInt(option.value))) {
                            option.style.display = "none"; 
                        } else {
                            option.style.display = "block"; 
                        }
                    });
                });
            })
            .catch(error => console.error("Error al cargar rentas:", error));
    }
    
    document.getElementById("crearRentaModal").addEventListener("show.bs.modal", filtrarVehiculosDisponibles);
    document.getElementById("editarRentaModal").addEventListener("show.bs.modal", filtrarVehiculosDisponibles);

    function validarFecha(campo) {
        const fechaSeleccionada = new Date(campo.value);
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0);

        if (fechaSeleccionada < fechaActual) {
            mostrarErrorCampo(campo, "La fecha no puede ser anterior a hoy.");
            return false;
        }
        return true;
    }

    function validarFormularioRenta(formulario) {
        const vehiculo = formulario.querySelector("#vehiculo");
        const cliente = formulario.querySelector("#cliente");
        const empleado = formulario.querySelector("#empleado");
        const fecha_renta = formulario.querySelector("#fecha_renta");
        const fecha_devolucion = formulario.querySelector("#fecha_devolucion");
        const monto_por_dia = formulario.querySelector("#monto_por_dia");
        const cantidad_dias = formulario.querySelector("#cantidad_dias");
        const estado = formulario.querySelector("#estado");
    
        let valido = true;
    
        [vehiculo, cliente, empleado, fecha_renta, monto_por_dia, cantidad_dias, estado].forEach(campo => {
            if (!campo.value.trim()) {
                mostrarErrorCampo(campo, "Este campo es obligatorio.");
                valido = false;
            }
        });
    
        if (!validarFecha(fecha_renta)) {
            valido = false;
        }
    
        if (fecha_devolucion.value && new Date(fecha_devolucion.value) < new Date(fecha_renta.value)) {
            mostrarErrorCampo(fecha_devolucion, "La fecha de devolución no puede ser anterior a la de renta.");
            valido = false;
        }
    
        if (!monto_por_dia.value.trim() || isNaN(monto_por_dia.value) || parseFloat(monto_por_dia.value) < 0) {
            mostrarErrorCampo(monto_por_dia, "El monto por día debe ser un número positivo.");
            valido = false;
        }
        
    
        return valido;
    }
    

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

    function mostrarToast(tipo, mensaje) {
        const toastEl = document.getElementById(`toast${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
        toastEl.querySelector('.toast-body').innerText = mensaje;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

    document.querySelectorAll("input, select").forEach(campo => {
        campo.addEventListener("input", function () {
            limpiarErrorCampo(this);
        });
    });

    document.getElementById('guardarRenta').addEventListener('click', function () {
        const form = document.getElementById("crearRentaForm");
        if (!validarFormularioRenta(form)) return;

        const rentaData = {
            vehiculo: document.getElementById("vehiculo").value,
            cliente: document.getElementById("cliente").value,
            empleado: document.getElementById("empleado").value,
            fecha_renta: document.getElementById("fecha_renta").value,
            fecha_devolucion: document.getElementById("fecha_devolucion").value,
            monto_por_dia: document.getElementById("monto_por_dia").value,
            cantidad_dias: document.getElementById("cantidad_dias").value,
            comentario: document.getElementById("comentario").value,
            estado: document.getElementById("estado").value
        };

        fetch('/api/rentaDevolucion/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': form.querySelector("input[name=csrfmiddlewaretoken]").value
            },
            body: JSON.stringify(rentaData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                mostrarToast('success', data.message);
                form.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('crearRentaModal'));
                modal.hide();
                setTimeout(() => location.reload(), 1000);
            } else {
                mostrarToast('danger', data.error || 'Error al guardar la renta.');
            }
        })
        .catch(error => mostrarToast('danger', 'Error en la solicitud.'));
    });

    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
    
            fetch(`/api/rentaDevolucion/${id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Error al obtener los datos de la renta.");
                    }
                    return response.json();
                })
                .then(data => {
                    document.getElementById("editRentaId").value = id;
                    document.getElementById("editVehiculo").value = data.vehiculo;
                    document.getElementById("editCliente").value = data.cliente;
                    document.getElementById("editEmpleado").value = data.empleado;
                    document.getElementById("editFechaRenta").value = data.fecha_renta;
                    document.getElementById("editFechaDevolucion").value = data.fecha_devolucion;
                    document.getElementById("editMontoPorDia").value = data.monto_por_dia;
                    document.getElementById("editCantidadDias").value = data.cantidad_dias;
                    document.getElementById("editComentario").value = data.comentario;
                    document.getElementById("editEstado").value = data.estado;
    
                    new bootstrap.Modal(document.getElementById("editarRentaModal")).show();
                })
                .catch(error => {
                    mostrarToast("danger", "Error al cargar la renta.");
                    console.error("Error:", error);
                });
        });
    });
    
    document.getElementById("guardarCambiosRenta").addEventListener("click", function () {
        const id = document.getElementById("editRentaId").value;
    
        const montoPorDia = document.getElementById("editMontoPorDia").value.trim();
        const cantidadDias = document.getElementById("editCantidadDias").value.trim();
        const fechaRenta = document.getElementById("editFechaRenta").value;
        const fechaDevolucion = document.getElementById("editFechaDevolucion").value;
    
        let valido = true;
    
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
    
        document.querySelectorAll(".is-invalid").forEach(elemento => elemento.classList.remove("is-invalid"));
        document.querySelectorAll(".invalid-feedback").forEach(elemento => elemento.remove());
    
        if (!montoPorDia || isNaN(montoPorDia) || parseFloat(montoPorDia) < 0) {
            mostrarErrorCampo(document.getElementById("editMontoPorDia"), "El monto por día debe ser un número positivo.");
        }
    
        if (!cantidadDias || isNaN(cantidadDias) || parseInt(cantidadDias) <= 0) {
            mostrarErrorCampo(document.getElementById("editCantidadDias"), "La cantidad de días debe ser un número positivo.");
        }

        if (!validarFecha(fechaRenta)) {
            valido = false;
        }
    
        if (!validarFecha(fechaDevolucion)) {
            valido = false;
        }
    
    
        if (fechaRenta && fechaDevolucion && new Date(fechaRenta) > new Date(fechaDevolucion)) {
            mostrarErrorCampo(document.getElementById("editFechaDevolucion"), "La fecha de devolución debe ser posterior a la fecha de renta.");
        }
    
        if (!valido) {
            return;
        }
    
        const rentaData = {
            vehiculo: document.getElementById("editVehiculo").value,
            cliente: document.getElementById("editCliente").value,
            empleado: document.getElementById("editEmpleado").value,
            fecha_renta: fechaRenta,
            fecha_devolucion: fechaDevolucion,
            monto_por_dia: montoPorDia,
            cantidad_dias: cantidadDias,
            comentario: document.getElementById("editComentario").value,
            estado: document.getElementById("editEstado").value
        };
    
        fetch(`/api/rentaDevolucion/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("input[name=csrfmiddlewaretoken]").value
            },
            body: JSON.stringify(rentaData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al actualizar la renta.");
            }
            return response.json();
        })
        .then(data => {
            mostrarToast("success", "Renta actualizada correctamente.");
            setTimeout(() => location.reload(), 1000);
        })
        .catch(error => {
            mostrarToast("danger", "Error al actualizar la renta.");
            console.error("Error:", error);
        });
    });
    
    
    document.querySelectorAll(".btn-eliminar").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            document.getElementById("renta_id_eliminar").value = id;
            new bootstrap.Modal(document.getElementById("eliminarRentaModal")).show();
        });
    });
    
    document.getElementById("confirmarEliminarRenta").addEventListener("click", function () {
        const id = document.getElementById("renta_id_eliminar").value;
        
        if (!id) {
            mostrarToast("danger", "Error: No se pudo obtener el ID de la renta.");
            return;
        }
        
        fetch(`/api/rentaDevolucion/${id}`, {
            method: "DELETE",
            headers: { 
                "X-CSRFToken": document.querySelector("input[name=csrfmiddlewaretoken]").value
            }
        })
        .then(response => {
            if (!response.ok) throw new Error("Error al eliminar la renta");
            return response.json();
        })
        .then(data => {
            mostrarToast("success", "Renta eliminada exitosamente.");
            setTimeout(() => location.reload(), 1000);
        })
        .catch(error => mostrarToast("danger", "Error al eliminar la renta."));
    });

});