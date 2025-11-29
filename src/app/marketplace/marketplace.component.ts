import { Component, OnInit } from '@angular/core';
import { Product } from './product/product.component';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
})
export class MarketplaceComponent  implements OnInit {

  products: Product[] = [];

  constructor() {
    // Mock data for the marketplace start page
    this.products = [
      {
        id: 1,
        title: 'Беспроводные наушники A7',
        description: 'Активное шумоподавление, 30 часов работы, USB-C',
        price: 4990,
        oldPrice: 6990,
        currency: '₽',
        rating: 4.5,
        reviews: 124,
        image: '/assets/img/headphones.jpg',
        badge: 'Хит',
        seller: 'AudioStore'
      },
      {
        id: 2,
        title: 'Умные часы X10',
        description: 'Измерение пульса, GPS, водозащита 5ATM',
        price: 9990,
        currency: '₽',
        rating: 4.2,
        reviews: 87,
        image: '/assets/img/watch.jpg',
        badge: 'New',
        seller: 'TimeTech'
      },
      {
        id: 3,
        title: 'Портативный зарядный 20000 mAh',
        description: 'Быстрая зарядка, два USB выхода',
        price: 2590,
        currency: '₽',
        rating: 4.8,
        reviews: 40,
        image: '/assets/img/powerbank.jpg',
        seller: 'PowerHouse'
      }
    ];
  }

  ngOnInit() {}

  onAddToCart(product: Product) {
    // TODO: wire with cart service — for now show console log
    console.log('Добавлено в корзину:', product);
  }

  onViewDetails(product: Product) {
    // TODO: navigate to product detail view
    console.log('Показать детали для:', product);
  }

}
