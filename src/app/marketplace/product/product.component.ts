import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface Product {
  id: string | number;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  oldPrice?: number;
  rating?: number; // 0-5
  reviews?: number;
  image?: string;
  badge?: string; // e.g., "New", "Sale"
  seller?: string;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent  implements OnInit {

  @Input() product: Product | null = null;
  @Input() showActions = true;

  @Output() addToCart = new EventEmitter<Product>();
  @Output() viewDetails = new EventEmitter<Product>();

  constructor() { }

  ngOnInit() {}

  onAddToCart() {
    if (this.product) this.addToCart.emit(this.product);
  }

  onViewDetails() {
    if (this.product) this.viewDetails.emit(this.product);
  }

  formatPrice(p: number | undefined, currency = '₽') {
    if (p == null) return '';
    return `${p.toLocaleString('ru-RU')} ${currency}`;
  }

}
