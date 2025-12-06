import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../services/marketplace.service';
import { CartItem } from '../models/marketplace.models';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;

  constructor(
    private marketplaceService: MarketplaceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.marketplaceService.cart$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  calculateTotal() {
    this.totalPrice = this.cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  }

  removeFromCart(productId: string | number) {
    this.marketplaceService.removeFromCart(productId);
    this.loadCart();
  }

  increaseQuantity(item: CartItem) {
    item.quantity++;
    this.calculateTotal();
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
      this.calculateTotal();
    }
  }

  clearCart() {
    if (confirm('Вы уверены, что хотите очистить корзину?')) {
      // TODO: Реализовать очистку корзины
      this.cartItems = [];
      this.totalPrice = 0;
    }
  }

  checkout() {
    if (this.cartItems.length === 0) {
      alert('Корзина пуста!');
      return;
    }
    // TODO: Реализовать оформление заказа
    alert(`Заказ на сумму ${this.formatPrice(this.totalPrice)} принят!`);
  }

  goBack() {
    this.router.navigate(['/marketplace']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  }
}
