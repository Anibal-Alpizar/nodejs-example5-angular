import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CartService, ItemCart } from 'src/app/share/cart.service';
import { GenericService } from 'src/app/share/generic.service';
import {
  NotificacionService,
  TipoMessage,
} from 'src/app/share/notification.service';

@Component({
  selector: 'app-orden-index',
  templateUrl: './orden-index.component.html',
  styleUrls: ['./orden-index.component.css'],
})
export class OrdenIndexComponent implements OnInit {
  total = 0;
  fecha = Date.now();
  qtyItems = 0;
  //Tabla
  displayedColumns: string[] = [
    'producto',
    'precio',
    'cantidad',
    'subtotal',
    'acciones',
  ];
  dataSource = new MatTableDataSource<any>();
  constructor(
    private cartService: CartService,
    private noti: NotificacionService,
    private gService: GenericService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.currentDataCart$.subscribe((response) => {
      this.dataSource = new MatTableDataSource(response);
    });
    this.total = this.cartService.getTotal();
  }
  actualizarCantidad(item: any) {
    this.cartService.addToCart(item);
    this.total = this.cartService.getTotal();
    this.noti.mensaje(
      'Cantidad actualizada',
      'Se actualizó la cantidad del producto en el carrito de compras',
      TipoMessage.success
    );
  }
  eliminarItem(item: any) {
    this.cartService.removeFromCart(item);
    this.total = this.cartService.getTotal();
    this.noti.mensaje(
      'Producto eliminado',
      'Se eliminó el producto del carrito de compras',
      TipoMessage.warning
    );
  }
  registrarOrden() {
    if (this.cartService.getItems != null) {
      // tabla intermedia
      // lista de objetos {videojuegoid: valor, cantidad: valor}
      let itemsCarrito = this.cartService.getItems;
      let detalle = itemsCarrito.map((x) => ({
        ['videojuegoId']: x.idItem,
        ['cantidad']: x.cantidad,
      }));
      // datos para el api
      let infoOrden = {
        fechaOrden: new Date(this.fecha),
        videojuego: detalle,
      };
      console.log(infoOrden);
      this.gService.create('orden', infoOrden).subscribe((respuesta: any) => {
        this.noti.mensaje(
          'Orden registrada',
          'Se registró la orden de compra',
          TipoMessage.success
        );
        this.cartService.deleteCart();
        this.total = this.cartService.getTotal();
        console.log(respuesta);
      });
    } else {
      this.noti.mensaje(
        'Error',
        'No hay productos en el carrito',
        TipoMessage.error
      );
    }
  }
}
