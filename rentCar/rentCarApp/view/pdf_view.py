from django.http import HttpResponse
from django.template.loader import render_to_string
from django.template import Context
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Spacer, Table, TableStyle, Paragraph
from rentCarApp.models import RentaDevolucion
import json
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from io import BytesIO


def generar_pdf(request):
    if request.method == 'POST':
        filtros = json.loads(request.body)
        rentas = aplicar_filtros(filtros)

        data = []
        header = ['ID', 'Vehículo', 'Cliente', 'Empleado', 'Fecha Renta', 'Fecha Devolución', 'Monto/Día', 'Cantidad Días', 'Comentario', 'Estado']
        data.append(header)

        for renta in rentas:
            row = [
                renta.identificador,
                renta.vehiculo.descripcion,
                renta.cliente.nombre,
                renta.empleado.nombre,
                renta.fecha_renta.strftime("%Y-%m-%d"),
                renta.fecha_devolucion.strftime("%Y-%m-%d") if renta.fecha_devolucion else "No devuelto",
                f"${renta.monto_por_dia}",
                renta.cantidad_dias,
                renta.comentario if renta.comentario else "Sin comentarios",
                renta.estado.descripcion
            ]
            data.append(row)

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), leftMargin=30, rightMargin=30, topMargin=40, bottomMargin=30)
        table = Table(data)

        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ]))

        elements = []
        styles = getSampleStyleSheet()

        title = Paragraph("<b>Reporte de Rentas y Devoluciones</b>", styles["Title"])
        elements.append(title)
        elements.append(Spacer(1, 15))

        elements.append(table)

        doc.build(elements)

        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="rentas_devoluciones.pdf"'
        return response


def aplicar_filtros(filtros):
    rentas = RentaDevolucion.objects.all()

    if filtros.get('filtroVehiculo'):
        rentas = rentas.filter(vehiculo_id=filtros['filtroVehiculo'])

    if filtros.get('filtroCliente'):
        rentas = rentas.filter(cliente_id=filtros['filtroCliente'])

    if filtros.get('filtroEmpleado'):
        rentas = rentas.filter(empleado_id=filtros['filtroEmpleado'])

    if filtros.get('filtroFechaRenta'):
        rentas = rentas.filter(fecha_renta=filtros['filtroFechaRenta'])

    if filtros.get('filtroFechaDevolucion'):
        rentas = rentas.filter(fecha_devolucion=filtros['filtroFechaDevolucion'])

    if filtros.get('filtroEstado'):
        rentas = rentas.filter(estado_id=filtros['filtroEstado'])

    return rentas
