from tabulate import tabulate

Prod = []
Usr = []
IdProd = 0
IdUsr = 0

""" Funciones Menu Principal """
def Menu():
  while True:
    print ("\n--- Gestion Administrativa ---")
    print ("\n 1) Gestionar Inventario")
    print ("\n 2) Gestionar Usuarios")
    print ("\n 3) Salir \n")
    MenOp = input(":")

    if MenOp == '1':
      print ("Bienvenido al inventario")
      GestionInventario()
      return

    elif MenOp == '2':
      print ("Bienvenido a la gestion de usuarios")
      GestionUsuarios()
      return

    else:
      print ("Hasta luego :D")
      return

""" Funciones Productos  """
def GestionInventario():
  ProdOp = 0

  while True:
    print ("\n 1) Agregar Producto ")
    print ("\n 2) Eliminar Producto ")
    print ("\n 3) Listado De Productos ")
    print ("\n 4) Menu Principal \n")
    ProdOp = input(":")

    if (ProdOp == '1'):
      AgregarProducto(Prod)
      return

    elif (ProdOp == '2'):
      EliminarProductos(Prod)
      return

    elif (ProdOp == '3'):
      ProdOp = 0
      print ("\n --- Lista --- \n")
      ListadoProductos(Prod)
      return

    else:
      Menu()
      return

""" Funciones usuario """
def GestionUsuarios():
  UsrOp = 0

  while True:
    print("\n 1) Agregar Usuario")
    print("\n 2) Eliminar Usuario")
    print("\n 3) Lista De Usuario")
    print("\n 4) Menu Principal \n")
    UsrOp = input("")

    if (UsrOp == '1'):
      AgregarUsuario(Usr)
      return
    
    elif (UsrOp == '2'):
      EliminarUsuario(Usr)
      return
    
    elif (UsrOp == '3'):
      print ("\n --- Lista --- \n")
      ListadoUsuarios(Usr)
      return
    
    else:
      Menu()
      return
    
""" Agregacion Usuarios """
def AgregarUsuario(ListaUsr):
  print("\n Ingrese por favor los datos del usuario ")

  global IdUsr

  Nombre = input("\n Ingrese el nombre del usuario: ")
  Apellido = input("\n Ingrese el apellido del usuario: ")
  Rol = input("\n Ingrese el rol del usuario:")
  Usuario = input("\n Ingrese el usuario: ")
  Contra = input("\n Ingrese la contraseña: ")
  ConContra = input("\n Ingrese nuevamente la contraseña: ")

  Usr.append({
    "IdUsr": IdUsr,
    "Nombre": Nombre,
    "Apellido": Apellido,
    "Rol": Rol,
    "Usuario": Usuario,
    "Contra": Contra,
    "ConContra": ConContra

  })

  IdUsr += 1

  GestionUsuarios()
  return

""" Eliminacion Usuarios """
def EliminarUsuario(ListaUsr):
  if not ListaUsr:
    print("\n No existen datos de usuarios registrados para eliminar ")

    GestionUsuarios()
    return
  
  try:
    IdSearch = int(input("\n Ingrese el ID del usuario a eliminar: "))
    
  except ValueError:
    print("\n El usuario con el ID ingresado no existe ")

    GestionUsuarios()
    return
  
  for p in ListaUsr:
    if p["IdUsr"] == IdSearch:
      ListaUsr.remove(p)
      print("\n Usuario eliminado correctamente ")

      GestionUsuarios()
      return
    
  print("\n El usuario con el ID ingresado no a sido encontrado ")

  GestionUsuarios()
  return

""" Lista Usuarios """
def ListadoUsuarios(ListaUsr):
  print("\n" + "="*60)
  print("Listado De Usuarios")
  print("="*60)

  if not ListaUsr:
    print("\n No hay usuarios registrados \n")
    GestionUsuarios()
  else:
    for p in ListaUsr:
      print (tabulate(ListaUsr,
                headers="keys",
                tablefmt="grid",
                showindex=True,
                numalign="right",
                stralign="left"
                ))
      
      print(f"\n{'-'*40}")
      print(f"\n Usuarios totales: {len(ListaUsr)}")

      GestionUsuarios()
      return      

""" Agregacion Productos """
def AgregarProducto(ListaProd):
  print("\n Ingrese por favor los datos del producto ")

  global IdProd

  Nombre = input("\n Nombre del producto: ")
  Cantidad = int(input("\n Cantidad del producto: "))
  Marca = input("\n Marca del producto: ")
  Precio = float(input("\n Precio del producto: "))

  Prod.append({
    "IdProd": IdProd,
    "Nombre": Nombre,
    "Cantidad": Cantidad,
    "Marca": Marca,
    "Precio": Precio
    
  })

  IdProd += 1

  GestionInventario()
  return

""" Listado Productos """
def ListadoProductos(ListaProd):
  print("\n" + "="*60)
  print("Inventario de productos")
  print("="*60)

  if not ListaProd:
    print("\n No hay productos en el inventario \n ")
    GestionInventario()
  else:
    for p in ListaProd:

      print (tabulate(ListaProd,
                      headers="keys",
                      tablefmt="grid",
                      showindex=True,
                      numalign="right",
                      stralign="left"
                      ))
      
      print(f"\n{'-'*40}")
      print(f"\n Productos totales: {len(ListaProd)}")
      ValTotal = sum(p["Precio"] for p in ListaProd)
      print(f"Valor total del inventario: ${ValTotal:.2f}")

      GestionInventario()
      return

""" Eliminacion de productos"""
def EliminarProductos (ListaProd):
  if not ListaProd:
    print ("\n No existen productos registrados para su eliminacion ")

    GestionInventario()
    return
  
  try:
    IdSearch = int(input("\n Ingrese el ID del producto a eliminar: "))

  except ValueError:
    print ("\n El producto con el ID ingresado no existe ") 

    GestionInventario()
    return
  
  for p in ListaProd:
    if p["IdProd"] == IdSearch:
      ListaProd.remove(p)
      print ("\n Producto eliminado satisfactoriamente ")

      GestionInventario()
      return
    
  print("\n El producto con el Id ingresado no a sido encontrado ")

  GestionInventario()
  return

""" Llamado Menu """
Menu()

