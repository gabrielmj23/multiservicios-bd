CREATE DATABASE MultiserviciosMundial
USE MultiserviciosMundial

CREATE TABLE Sucursales (
	RIFSuc VARCHAR(12) PRIMARY KEY,
	NombreSuc VARCHAR(20) NOT NULL,
	CiudadSuc VARCHAR(30) NOT NULL,
	CIEncargado VARCHAR(10) NOT NULL,
	FechaInicioEncargado DATE NOT NULL
)

CREATE TABLE TiposVehiculos (
	CodTipo INT IDENTITY(1,1) PRIMARY KEY,
	NombreTipo VARCHAR(20) UNIQUE NOT NULL
)

CREATE TABLE Marcas (
	CodMarca INT IDENTITY(1,1) PRIMARY KEY,
	NombreMarca VARCHAR(20) UNIQUE NOT NULL
)

CREATE TABLE Clientes (
	CICliente VARCHAR(10) PRIMARY KEY,
	NombreCliente VARCHAR(30) NOT NULL,
	Tlf1 VARCHAR(12) NOT NULL,
	Tlf2 VARCHAR(12) NOT NULL,
	EmailCliente VARCHAR(50) NOT NULL
)

CREATE TABLE Vehiculos (
	CodVehiculo INT IDENTITY(1,1) PRIMARY KEY,
	PlacaVehic VARCHAR(8) NOT NULL,
	FechaAdq DATE NOT NULL,
	TipoAceite VARCHAR(15) NOT NULL,
	CodMarca INT NOT NULL,
	CodModelo INT NOT NULL,
	CIPropietario VARCHAR(10),
	FOREIGN KEY (CIPropietario) REFERENCES Clientes(CICliente) ON UPDATE CASCADE
)

CREATE TABLE Servicios (
	CodServicio INT IDENTITY(1,1) PRIMARY KEY,
	NombreServ VARCHAR(25) UNIQUE NOT NULL,
	MontoServ DECIMAL(6,2) NOT NULL,
	CIEncargado VARCHAR(10) NOT NULL,
	CICoordinador VARCHAR(10) NOT NULL,
	CHECK (MontoServ >= 0)
)

CREATE TABLE Reservas (
	NumReserva INT IDENTITY(1,1) PRIMARY KEY,
	FechaReserva DATETIME NOT NULL,
	FechaServicio DATETIME NOT NULL,
	Abono DECIMAL(6,2) NOT NULL,
	CodServicio INT NOT NULL,
	CodVehiculo INT NOT NULL,
	RIFSucursal VARCHAR(12) NOT NULL,
	FOREIGN KEY (CodServicio) REFERENCES Servicios(CodServicio) ON UPDATE CASCADE,
	FOREIGN KEY (CodVehiculo) REFERENCES Vehiculos(CodVehiculo) ON UPDATE CASCADE,
	FOREIGN KEY (RIFSucursal) REFERENCES Sucursales(RIFSuc) ON UPDATE CASCADE
)

CREATE TABLE Empleados (
	CIEmpleado VARCHAR(10) PRIMARY KEY,
	NombreEmp VARCHAR(30) NOT NULL,
	DireccionEmp VARCHAR(30) NOT NULL,
	TlfEmp VARCHAR(12) NOT NULL,
	SalarioEmp DECIMAL(6,2) NOT NULL,
	RIFSuc VARCHAR(12) NOT NULL,
	FOREIGN KEY (RIFSuc) REFERENCES Sucursales(RIFSuc) ON UPDATE CASCADE,
	CHECK (SalarioEmp > 0)
)

CREATE TABLE FichasServicios (
	CodFicha INT IDENTITY(1,1) PRIMARY KEY,
	Autorizado VARCHAR(10),
	TiempoEnt DATETIME NOT NULL,
	TiempoSalEst DATETIME NOT NULL,
	TiempoSalReal DATETIME NOT NULL,
	CodVehiculo INT NOT NULL,
	FOREIGN KEY (CodVehiculo) REFERENCES Vehiculos(CodVehiculo) ON UPDATE CASCADE
)

CREATE TABLE LineasSuministro (
	CodLinea INT IDENTITY(1,1) PRIMARY KEY,
	NombreLinea VARCHAR(30) NOT NULL
)

CREATE TABLE Proveedores (
	RIFProv VARCHAR(12) PRIMARY KEY,
	RazonProv VARCHAR(30) NOT NULL,
	DireccionProv VARCHAR(30) NOT NULL,
	TlfLocal VARCHAR(12) NOT NULL,
	TlfCelular VARCHAR(12) NOT NULL,
	PersonaCont VARCHAR(12) NOT NULL,
	CodLinea INT NOT NULL,
	FOREIGN KEY (CodLinea) REFERENCES LineasSuministro(CodLinea) ON UPDATE CASCADE
)

CREATE TABLE Insumos (
	CodIns INT IDENTITY(1,1) PRIMARY KEY,
	NombreIns VARCHAR(15) NOT NULL,
	DescripcionIns VARCHAR(30) NOT NULL,
	FabricanteIns VARCHAR(30) NOT NULL,
	EsEco BIT NOT NULL,
	PrecioIns DECIMAL(6,2) NOT NULL,
	ExistIns INT NOT NULL,
	MinIns INT NOT NULL,
	MaxIns INT NOT NULL,
	UMedida VARCHAR(10) NOT NULL,
	CodLinea INT NOT NULL,
	CHECK (ExistIns > 0),
	CHECK (MinIns >= 0),
	CHECK (MaxIns > MinIns),
	FOREIGN KEY (CodLinea) REFERENCES LineasSuministro(CodLinea) ON UPDATE CASCADE
)

CREATE TABLE RequisicionesCompra (
	CodReq INT IDENTITY(1,1) PRIMARY KEY,
	FechaReq DATETIME NOT NULL,
	CodLinea INT NOT NULL,
	FOREIGN KEY (CodLinea) REFERENCES LineasSuministro(CodLinea) ON UPDATE CASCADE
)

CREATE TABLE OrdenesCompra (
	CodOrden INT IDENTITY(1,1) PRIMARY KEY,
	FechaOrd DATETIME NOT NULL,
	RIFProv VARCHAR(12) NOT NULL,
	CodReq INT NOT NULL,
	FOREIGN KEY (RIFProv) REFERENCES Proveedores(RIFProv) ON UPDATE CASCADE,
	FOREIGN KEY (CodReq) REFERENCES RequisicionesCompra(CodReq) ON UPDATE NO ACTION
)

CREATE TABLE FacturasProveedor (
	CodFProv INT IDENTITY(1,1) PRIMARY KEY,
	FechaFProv DATETIME NOT NULL,
	MontoFProv DECIMAL(6,2) NOT NULL,
	CodOrden INT NOT NULL,
	CHECK (MontoFProv > 0),
	FOREIGN KEY (CodOrden) REFERENCES OrdenesCompra(CodOrden) ON UPDATE CASCADE
)

CREATE TABLE FacturasTienda (
	CodFTien INT IDENTITY(1,1) PRIMARY KEY,
	FechaFTien DATETIME NOT NULL,
	CICliente VARCHAR(10) NOT NULL,
	MontoFTien DECIMAL(6,2) NOT NULL,
	FOREIGN KEY (CICliente) REFERENCES Clientes(CICliente) ON UPDATE CASCADE
)

CREATE TABLE FacturasServicio (
	CodFServ INT IDENTITY(1,1) PRIMARY KEY,
	FechaFServ DATETIME NOT NULL,
	MontoFServ DECIMAL(6,2) NOT NULL,
	PorcDcto DECIMAL(6,2),
	CodFicha INT NOT NULL,
	CHECK (MontoFServ >= 0),
	CHECK ((PorcDcto >= 0.05 AND PorcDcto <= 0.15) OR PorcDcto = NULL),
	FOREIGN KEY (CodFicha) REFERENCES FichasServicios(CodFicha) ON UPDATE CASCADE
)

CREATE TABLE ArticulosTienda (
	CodArticuloT INT IDENTITY(1,1) PRIMARY KEY,
	NombreArticuloT VARCHAR(30) NOT NULL,
	Precio DECIMAL(6,2) NOT NULL,
	RIFSuc VARCHAR(12) NOT NULL,
	CHECK (Precio > 0),
	FOREIGN KEY (RIFSuc) REFERENCES Sucursales(RIFSuc) ON UPDATE CASCADE
)

CREATE TABLE Descuentos (
	CodDesc INT IDENTITY(1,1) NOT NULL,
	Porcentaje DECIMAL(3,2) NOT NULL,
	NumServReq INT NOT NULL,
	RIFSuc Varchar(12) NOT NULL,
	CHECK (Porcentaje >= 0.05 AND Porcentaje <= 0.15),
	CHECK (NumServReq > 0),
	FOREIGN KEY (RIFSuc) REFERENCES Sucursales(RIFSuc) ON UPDATE CASCADE
)

CREATE TABLE AjustesInventario (
	CodAjuste INT IDENTITY(1,1) PRIMARY KEY,
	FechaAjuste DATETIME NOT NULL,
	TipoAjuste CHAR NOT NULL,
	ComentarioAjuste VARCHAR(50) NOT NULL,
	CodIns INT NOT NULL,
	Diferencia INT NOT NULL,
	CHECK (TipoAjuste = 'F' OR TipoAjuste = 'S'),
	FOREIGN KEY (CodIns) REFERENCES Insumos(CodIns) ON UPDATE CASCADE
)

CREATE TABLE Modelos (
	CodMarca INT NOT NULL,
	CodModelo INT IDENTITY(1,1) NOT NULL,
	DescModelo VARCHAR(20) NOT NULL,
	NumPuestos INT NOT NULL,
	Peso DECIMAL(6,2) NOT NULL,
	TipoAcMotor VARCHAR(12) NOT NULL,
	TIpoAcCaja VARCHAR(12) NOT NULL,
	Octan INT NOT NULL,
	TipoRefri VARCHAR(12) NOT NULL,
	CodTipo INT NOT NULL,
	CHECK (NumPuestos > 0),
	CHECK (Peso > 0),
	CHECK (Octan = 87 OR Octan = 89 OR Octan = 91),
	PRIMARY KEY (CodMarca, CodModelo),
	FOREIGN KEY (CodTipo) REFERENCES TiposVehiculos(CodTipo) ON UPDATE CASCADE
)

CREATE TABLE Actividades (
	CodServicio INT NOT NULL,
	CodActividad INT IDENTITY(1,1) NOT NULL,
	DescActividad VARCHAR(30) NOT NULL,
	CostoHora DECIMAL(6,2) NOT NULL,
	CHECK (CostoHora > 0),
	PRIMARY KEY (CodServicio, CodActividad),
	FOREIGN KEY (CodServicio) REFERENCES Servicios(CodServicio) ON UPDATE CASCADE
)

CREATE TABLE ActividadesRealizadas (
	CodFicha INT NOT NULL,
	CodServicio INT NOT NULL,
	CodAct INT NOT NULL,
	NumRealizada INT IDENTITY(1,1) NOT NULL,
	PrecioHora DECIMAL(6,2) NOT NULL,
	Tiempo DECIMAL(4,2) NOT NULL,
	CHECK (PrecioHora > 0),
	CHECK (Tiempo > 0),
	PRIMARY KEY (CodFicha, CodServicio, CodAct, NumRealizada),
	FOREIGN KEY (CodServicio, CodAct) REFERENCES Actividades(CodServicio, CodActividad) ON UPDATE CASCADE,
	FOREIGN KEY (CodFicha) REFERENCES FichasServicios(CodFicha) ON UPDATE CASCADE
)

CREATE TABLE PagosTienda (
	CodFactura INT NOT NULL,
	NumPago INT IDENTITY(1,1) NOT NULL,
	MontoPago DECIMAL(6,2) NOT NULL,
	TipoPago CHAR NOT NULL,
	Moneda CHAR,
	NumTelefPago VARCHAR(12),
	FechaPago DATETIME,
	RefPago VARCHAR(12),
	TipoTarje CHAR,
	NumTarje VARCHAR(16),
	BancoTarje VARCHAR(20),
	CHECK (TipoPago = 'E' OR TipoPago = 'M' OR TipoPago = 'T'),
	CHECK (TipoPago = 'E' AND (Moneda = 'B' OR Moneda = 'D')),
	CHECK (TipoPago = 'M' AND (NumTelefPago <> NULL AND FechaPago <> NULL AND RefPago <> NULL)),
	CHECK (TipoPago = 'T' AND (TipoTarje = 'D' OR TipoTarje = 'C') AND NumTarje <> NULL AND BancoTarje <> NULL),
	PRIMARY KEY (CodFactura, NumPago),
	FOREIGN KEY (CodFactura) REFERENCES FacturasTienda(CodFTien) ON UPDATE CASCADE
)

CREATE TABLE PagosServicios (
	CodFactura INT NOT NULL,
	NumPago INT IDENTITY(1,1) NOT NULL,
	MontoPago DECIMAL(6,2) NOT NULL,
	TipoPago CHAR NOT NULL,
	Moneda CHAR,
	NumTelefPago VARCHAR(12),
	FechaPago DATETIME,
	RefPago VARCHAR(12),
	TipoTarje CHAR,
	NumTarje VARCHAR(16),
	BancoTarje VARCHAR(20),
	CHECK (TipoPago = 'E' OR TipoPago = 'M' OR TipoPago = 'T'),
	CHECK (TipoPago = 'E' AND (Moneda = 'B' OR Moneda = 'D')),
	CHECK (TipoPago = 'M' AND (NumTelefPago <> NULL AND FechaPago <> NULL AND RefPago <> NULL)),
	CHECK (TipoPago = 'T' AND (TipoTarje = 'D' OR TipoTarje = 'C') AND NumTarje <> NULL AND BancoTarje <> NULL),
	PRIMARY KEY (CodFactura, NumPago),
	FOREIGN KEY (CodFactura) REFERENCES FacturasServicio(CodFServ) ON UPDATE CASCADE
)

CREATE TABLE SucursalesAtiendenVehiculos (
	RIFSucursal VARCHAR(12) NOT NULL,
	CodTipo INT NOT NULL,
	PRIMARY KEY (RIFSucursal, CodTipo),
	FOREIGN KEY (RIFSucursal) REFERENCES Sucursales(RIFSuc) ON UPDATE CASCADE,
	FOREIGN KEY (CodTipo) REFERENCES TiposVehiculos(CodTipo) ON UPDATE CASCADE
)

CREATE TABLE FacturasTiendaIncluyen (
	CodFTien INT NOT NULL,
	CodArticuloT INT NOT NULL,
	Cantidad INT NOT NULL,
	Precio DECIMAL(6,2) NOT NULL,
	CHECK (Cantidad > 0),
	CHECK (Precio > 0),
	PRIMARY KEY (CodFTien, CodArticuloT),
	FOREIGN KEY (CodFTien) REFERENCES FacturasTienda(CodFTien) ON UPDATE CASCADE,
	FOREIGN KEY (CodArticuloT) REFERENCES ArticulosTienda(CodArticuloT) ON UPDATE CASCADE
)

CREATE TABLE ModelosDebenRecibirPorKilometraje (
	CodMarca INT NOT NULL,
	CodModelo INT NOT NULL,
	CodServicio INT NOT NULL,
	Kilometraje INT NOT NULL,
	CHECK (Kilometraje > 0),
	PRIMARY KEY (CodMarca, CodModelo, CodServicio, Kilometraje),
	FOREIGN KEY (CodMarca, CodModelo) REFERENCES Modelos(CodMarca, CodModelo) ON UPDATE CASCADE,
	FOREIGN KEY (CodServicio) REFERENCES Servicios(CodServicio) ON UPDATE CASCADE
)

CREATE TABLE ModelosDebenRecibirPorTiempoUso (
	CodMarca INT NOT NULL,
	CodModelo INT NOT NULL,
	CodServicio INT NOT NULL,
	TiempoUso INT NOT NULL,
	CHECK (TiempoUso > 0),
	PRIMARY KEY (CodMarca, CodModelo, CodServicio, TiempoUso),
	FOREIGN KEY (CodMarca, CodModelo) REFERENCES Modelos(CodMarca, CodModelo) ON UPDATE CASCADE,
	FOREIGN KEY (CodServicio) REFERENCES Servicios(CodServicio) ON UPDATE CASCADE
)

CREATE TABLE SucursalesOfrecen (
	RIFSucursal VARCHAR(12) NOT NULL,
	CodServicio INT NOT NULL,
	Capacidad INT NOT NULL,
	TiempoReserva INT NOT NULL,
	CHECK (TiempoReserva >= 0),
	PRIMARY KEY (RIFSucursal, CodServicio),
	FOREIGN KEY (RIFSucursal) REFERENCES Sucursales(RIFSuc) ON UPDATE CASCADE,
	FOREIGN KEY (CodServicio) REFERENCES Servicios(CodServicio) ON UPDATE CASCADE
)

CREATE TABLE OrdenesCompraContienen (
	CodOrden INT NOT NULL,
	CodIns INT NOT NULL,
	PRIMARY KEY (CodOrden, CodIns),
	FOREIGN KEY (CodOrden) REFERENCES OrdenesCompra(CodOrden) ON UPDATE CASCADE,
	FOREIGN KEY (CodIns) REFERENCES Insumos(CodIns) ON UPDATE NO ACTION
)

CREATE TABLE RequisicionesCompraIncluyen (
	CodReq INT NOT NULL,
	CodIns INT NOT NULL,
	Cantidad INT NOT NULL,
	CHECK (Cantidad > 0),
	PRIMARY KEY (CodReq, CodIns),
	FOREIGN KEY (CodReq) REFERENCES RequisicionesCompra(CodReq) ON UPDATE CASCADE,
	FOREIGN KEY (CodIns) REFERENCES Insumos(CodIns) ON UPDATE NO ACTION
)

CREATE TABLE ActividadesRealizadasConsumen (
	CodFicha INT NOT NULL,
	CodServicio INT NOT NULL,
	CodAct INT NOT NULL,
	NumRealizada INT IDENTITY(1,1) NOT NULL,
	CodInsumo INT NOT NULL,
	CIEmpleado VARCHAR(10) NOT NULL,
	Cantidad INT NOT NULL,
	Precio DECIMAL(6,2) NOT NULL,
	CHECK (Cantidad > 0),
	CHECK (Precio > 0),
	PRIMARY KEY (CodFicha, CodServicio, CodAct, NumRealizada, CodInsumo, CIEmpleado),
	FOREIGN KEY (CodFicha, CodServicio, CodAct, NumRealizada) REFERENCES ActividadesRealizadas(CodFicha, CodServicio, CodAct, NumRealizada) ON UPDATE NO ACTION,
	FOREIGN KEY (CodInsumo) REFERENCES Insumos(CodIns) ON UPDATE CASCADE,
	FOREIGN KEY (CIEmpleado) REFERENCES Empleados(CIEmpleado) ON UPDATE CASCADE
)

CREATE TABLE MantenimientosVehiculos (
	CodVehiculo INT NOT NULL,
	Mantenimiento VARCHAR(50) NOT NULL,
	PRIMARY KEY (CodVehiculo, Mantenimiento),
	FOREIGN KEY (CodVehiculo) REFERENCES Vehiculos(CodVehiculo) ON UPDATE CASCADE
)

ALTER TABLE Sucursales
ADD FOREIGN KEY (CIEncargado) REFERENCES Empleados(CIEmpleado)
ON UPDATE NO ACTION

ALTER TABLE Vehiculos
ADD FOREIGN KEY (CodMarca, CodModelo) REFERENCES Modelos(CodMarca, CodModelo)
ON UPDATE CASCADE

ALTER TABLE Servicios
ADD FOREIGN KEY (CIEncargado) REFERENCES Empleados(CIEmpleado)
ON UPDATE NO ACTION

ALTER TABLE Servicios
ADD FOREIGN KEY (CICoordinador) REFERENCES Empleados(CIEmpleado)
ON UPDATE NO ACTION

-- Actualizaci�n autom�tica del monto del servicio
CREATE TRIGGER SumarMontoServicio
ON Actividades AFTER INSERT
AS
BEGIN
	DECLARE @CodServicio INT, @CostoHora DECIMAL(6,2)
	SELECT @CodServicio = CodServicio, @CostoHora = CostoHora FROM INSERTED
	UPDATE Servicios SET MontoServ = MontoServ + @CostoHora WHERE CodServicio = @CodServicio
END
CREATE TRIGGER ActualizarMontoServicio
ON Actividades AFTER UPDATE
AS
BEGIN
	IF UPDATE(CostoHora)
	BEGIN
		DECLARE @CodServicio INT, @NuevoCostoHora DECIMAL(6,2), @ViejoCostoHora DECIMAL(6,2)
		SELECT @CodServicio = CodServicio, @NuevoCostoHora = CostoHora FROM INSERTED
		SELECT @ViejoCostoHora = CostoHora FROM DELETED
		UPDATE Servicios SET MontoServ = MontoServ + @NuevoCostoHora - @ViejoCostoHora WHERE CodServicio = @CodServicio
	END
END
CREATE TRIGGER RestarMontoServicio
ON Actividades AFTER DELETE
AS
BEGIN
	DECLARE @CodServicio INT, @CostoHora DECIMAL(6,2)
	SELECT @CodServicio = CodServicio, @CostoHora = CostoHora FROM DELETED
	UPDATE Servicios SET MontoServ = MontoServ - @CostoHora WHERE CodServicio = @CodServicio
END

-- Chequear que el abono de servicio est� entre el 20 y 50% del monto del servicio
CREATE TRIGGER CheckAbono
ON Reservas AFTER INSERT
AS
BEGIN
	DECLARE @Abono DECIMAL(6, 2), @MontoServ DECIMAL(6, 2), @CodServicio INT
	SELECT @Abono = Abono, @CodServicio = CodServicio FROM INSERTED
	SELECT @MontoServ = MontoServ FROM Servicios WHERE CodServicio = @CodServicio
    IF @Abono < (@MontoServ * 0.2) OR @Abono > (@MontoServ * 0.5)
    BEGIN
        RAISERROR ('El abono debe estar entre el 20% y 50% del monto del servicio', 16, 1)
        ROLLBACK TRANSACTION
    END
END

-- El cliente recibe un descuento sobre el servicio en caso de haber cumplido con un m�nimo de servicios promedio en los �ltimos cuatro meses
CREATE TRIGGER DescuentoCliente
ON FacturasServicio AFTER INSERT
AS
BEGIN
	-- Hallar cliente
	DECLARE @CICliente VARCHAR(10)
	SELECT @CICliente = v.CIPropietario
	FROM INSERTED i, FichasServicios f, Vehiculos v
	WHERE i.CodFicha = f.CodFicha AND f.CodVehiculo = v.CodVehiculo
	-- Determinar cantidad de servicios promedio en los �ltimos cuatro meses
	DECLARE @ServPromedio DECIMAL(3, 1)
	SELECT @ServPromedio = AVG(cuenta) FROM (
		SELECT COUNT(*) AS cuenta
		FROM FichasServicios
		WHERE CodVehiculo IN (
			SELECT CodVehiculo FROM Vehiculos WHERE CIPropietario = @CICliente
		)
		AND FechaEnt >= DATEADD(mm, -4, GETDATE())
		GROUP BY MONTH(FechaEnt)
	)
	-- Encontrar el mayor descuento aplicable
	DECLARE @Porcentaje DECIMAL(6,2)
	SELECT TOP 1 @Porcentaje = Porcentaje
	FROM Descuentos
	WHERE NumServReq <= @ServPromedio
	ORDER BY NumServReq DESC
	-- Colocar valor en la factura
	DECLARE @CodFServ INT
	SELECT @CodFServ = CodFServ FROM INSERTED
	UPDATE FacturasServicio SET PorcDcto = @Porcentaje WHERE CodFServ = @CodFServ
END

-- Calcular monto de factura de servicios
CREATE TRIGGER MontoFactServicios
ON FacturasServicio AFTER INSERT
AS
BEGIN
	DECLARE @CodFServ INT, @MontoFact DECIMAL(6,2), @PorcDcto DECIMAL(6,2)
	SELECT @CodFServ = i.CodFServ, @PorcDcto = i.PorcDcto, @MontoFact = SUM(a.PrecioHora * a.Tiempo)
	FROM INSERTED i, ActividadesRealizadas a
	WHERE i.CodFServ = a.CodFicha
	GROUP BY i.CodFServ, i.PorcDcto
	IF @PorcDcto <> NULL
		UPDATE FacturasServicio SET MontoFServ = @MontoFact * (1 - @PorcDcto) WHERE CodFServ = @CodFServ
	ELSE
		UPDATE FacturasServicio SET MontoFServ = @MontoFact WHERE CodFServ = @CodFServ
END

-- Calcular monto de factura de la tienda
CREATE TRIGGER MontoFactTienda
ON FacturasTienda AFTER INSERT
AS
BEGIN
	DECLARE @CodFTien INT, @MontoFact DECIMAL(6,2)
	SELECT @CodFTien = i.CodFTien, @MontoFact = SUM(fti.Cantidad * fti.Precio)
	FROM INSERTED i, FacturasTiendaIncluyen fti
	WHERE i.CodFTien = fti.CodFTien
	GROUP BY i.CodFTien
	UPDATE FacturasTienda SET MontoFTien = @MontoFact WHERE CodFTien = @CodFTien
END

-- Una factura de servicio admite hasta dos modalidades de pago
CREATE TRIGGER CheckNumPagosServicios
ON PagosServicios AFTER INSERT
AS
BEGIN
	DECLARE @NumPagos INT, @CodFInserted INT
	SELECT @CodFInserted = CodFactura FROM INSERTED
	SELECT @NumPagos = COUNT(*)
	FROM PagosServicios
	WHERE CodFactura = @CodFInserted
	IF @NumPagos > 2
	BEGIN
		RAISERROR ('La orden ya tiene el m�ximo de pagos', 16, 1)
        ROLLBACK TRANSACTION
	END
END

-- La suma de los montos de los pagos para las facturas de servicio y de tiendas deben igualar el monto total de la factura
CREATE TRIGGER SumaPagosServicios
ON PagosServicios AFTER INSERT
AS
BEGIN
	DECLARE @NumPagos INT, @CodFInserted INT, @SumaPagos DECIMAL(6,2), @MontoAPagar DECIMAL(6,2)
	SELECT @CodFInserted = CodFactura FROM INSERTED
	-- Cantidad y total pagado
	SELECT @NumPagos = COUNT(*), @SumaPagos = SUM(MontoPago)
	FROM PagosServicios
	WHERE CodFactura = @CodFInserted
	-- Monto a pagar
	SELECT @MontoAPagar = MontoFServ
	FROM FacturasServicio
	WHERE CodFServ = @CodFInserted
	-- Validar
	IF @NumPagos = 2 AND @SumaPagos < @MontoAPagar
	BEGIN
		RAISERROR ('El monto pagado no es suficiente', 16, 1)
        ROLLBACK TRANSACTION
	END
END
CREATE TRIGGER SumaPagosTienda
ON PagosTienda AFTER INSERT
AS
BEGIN
	DECLARE @CodFInserted INT, @Pagado DECIMAL(6,2), @MontoAPagar DECIMAL(6,2)
	SELECT @CodFInserted = CodFactura, @Pagado = MontoPago
	FROM INSERTED
	-- Monto a pagar
	SELECT @MontoAPagar = MontoFTien
	FROM FacturasTienda
	WHERE CodFTien = @CodFInserted
	-- Validar
	IF @Pagado < @MontoAPagar
	BEGIN
		RAISERROR ('El monto pagado no es suficiente', 16, 1)
        ROLLBACK TRANSACTION
	END
END

-- Cuando la existencia de un insumo sea igual o menor al m�nimo, se incluye en una requisici�n de compra para su l�nea al final del d�a
-- En esta, la cantidad pedida del insumo lo deja un 25% mayor que el nivel m�nimo.
CREATE PROCEDURE CrearRequisiciones
AS
DECLARE @CursorLineas CURSOR, @CodLineaAct INT, @NumInsumosFaltantes INT, @CodReq INT, @CursorInsumos CURSOR, @CodIns INT, @MinIns INT, @ExistIns INT
BEGIN
	SET @CursorLineas = CURSOR FOR SELECT CodLinea FROM LineasSuministro
	OPEN @CursorLineas
	FETCH NEXT FROM @CursorLineas INTO @CodLineaAct
	WHILE @@FETCH_STATUS = 0
	BEGIN
		SELECT @NumInsumosFaltantes = COUNT(*)
		FROM Insumos
		WHERE CodLinea = @CodLineaAct
		AND ExistIns <= MinIns
		IF @NumInsumosFaltantes > 0
		BEGIN
			-- Crear requisici�n para esta l�nea
			INSERT INTO RequisicionesCompra (FechaReq, CodLinea)
			VALUES (CURRENT_TIMESTAMP, @CodLineaAct)
			SELECT @CodReq = SCOPE_IDENTITY()
			-- Conectar requisici�n con insumos
			SET @CursorInsumos = CURSOR FOR SELECT CodIns, MinIns, ExistIns FROM Insumos WHERE CodLinea = @CodLineaAct AND ExistIns <= MinIns
			OPEN @CursorInsumos
			FETCH NEXT FROM @CursorInsumos INTO @CodIns, @MinIns, @ExistIns
			WHILE @@FETCH_STATUS = 0
			BEGIN
				INSERT INTO RequisicionesCompraIncluyen (CodReq, CodIns, Cantidad)
				VALUES (@CodReq, @CodIns, CEILING(1.25 * @MinIns - @ExistIns))
				FETCH NEXT FROM @CursorInsumos INTO @CodIns, @MinIns, @ExistIns
			END
		END
		FETCH NEXT FROM @CursorLineas INTO @CodLineaAct
	END
END

-- No se permite hacer consumos de insumos cuando el inventario no es suficiente
CREATE TRIGGER InventarioSuficiente
ON ActividadesRealizadasConsumen AFTER INSERT
AS
BEGIN
	DECLARE @CodInsumo INT, @MinIns INT, @ExistIns INT
	SELECT @CodInsumo = CodInsumo FROM INSERTED
	SELECT @MinIns = MinIns, @ExistIns = ExistIns FROM Insumos WHERE CodIns = @CodInsumo
	IF @ExistIns <= @MinIns
	BEGIN
		RAISERROR ('No hay inventario suficiente de este insumo', 16, 1)
        ROLLBACK TRANSACTION
	END
END