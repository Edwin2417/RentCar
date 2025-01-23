from django.db import models

class Estado(models.Model):
    identificador = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=100)

    def __str__(self):
        return self.descripcion

class Rol(models.Model):
    identificador = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.descripcion

class Usuario(models.Model):
    identificador = models.AutoField(primary_key=True)
    nombre_usuario = models.CharField(max_length=50, unique=True)
    contrasena = models.CharField(max_length=255)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre_usuario

class TipoVehiculo(models.Model):
    identificador = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=100)
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)

    def __str__(self):
        return self.descripcion

class Marca(models.Model):
    identificador = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=100)
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)

    def __str__(self):
        return self.descripcion

class Modelo(models.Model):
    identificador = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=100)
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)

    def __str__(self):
        return self.descripcion

class TipoCombustible(models.Model):
    identificador = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=100)
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)

    def __str__(self):
        return self.descripcion

class Vehiculo(models.Model):
    identificador = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=100)
    no_chasis = models.CharField(max_length=50, unique=True)
    no_motor = models.CharField(max_length=50, unique=True)
    no_placa = models.CharField(max_length=50, unique=True)
    tipo_vehiculo = models.ForeignKey(TipoVehiculo, on_delete=models.CASCADE)
    marca = models.ForeignKey(Marca, on_delete=models.CASCADE)
    modelo = models.ForeignKey(Modelo, on_delete=models.CASCADE)
    tipo_combustible = models.ForeignKey(TipoCombustible, on_delete=models.CASCADE)
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)

    def __str__(self):
        return self.descripcion

class Cliente(models.Model):
    identificador = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    cedula = models.CharField(max_length=20, unique=True)
    no_tarjeta_cr = models.CharField(max_length=50)
    limite_credito = models.DecimalField(max_digits=18, decimal_places=2)
    tipo_persona = models.CharField(max_length=20, choices=[('Física', 'Física'), ('Jurídica', 'Jurídica')])
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre

class Empleado(models.Model):
    identificador = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    cedula = models.CharField(max_length=20, unique=True)
    tanda_labor = models.CharField(max_length=20, choices=[('Matutina', 'Matutina'), ('Vespertina', 'Vespertina'), ('Nocturna', 'Nocturna')])
    porciento_comision = models.DecimalField(max_digits=5, decimal_places=2)
    fecha_ingreso = models.DateField()
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.nombre

class Inspeccion(models.Model):
    identificador = models.AutoField(primary_key=True)
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    tiene_ralladuras = models.BooleanField()
    cantidad_combustible = models.CharField(
        max_length=10, 
        choices=[('1/4', '1/4'), ('1/2', '1/2'), ('3/4', '3/4'), ('Lleno', 'Lleno')]
    )
    tiene_goma_respuesta = models.BooleanField()
    tiene_gato = models.BooleanField()
    tiene_roturas_cristal = models.BooleanField()

    # Estado de cada goma
    goma_delantera_izquierda = models.BooleanField(default=True)
    goma_delantera_derecha = models.BooleanField(default=True)
    goma_trasera_izquierda = models.BooleanField(default=True)
    goma_trasera_derecha = models.BooleanField(default=True)

    fecha = models.DateField()
    empleado_inspeccion = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)

    def __str__(self):
        return f"Inspección {self.id}"

class RentaDevolucion(models.Model):
    identificador = models.AutoField(primary_key=True)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    fecha_renta = models.DateField()
    fecha_devolucion = models.DateField(null=True, blank=True)
    monto_por_dia = models.DecimalField(max_digits=18, decimal_places=2)
    cantidad_dias = models.PositiveIntegerField()
    comentario = models.TextField(null=True, blank=True)
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)

    def __str__(self):
        return f"Renta {self.id}"
