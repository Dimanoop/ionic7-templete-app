import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { MarketplaceService } from './services/marketplace.service';
import { Product, Category } from './models/marketplace.models';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
})
export class MarketplaceComponent implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  Math = Math; // Для использования в шаблоне
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  searchQuery: string = '';
  totalProducts: number = 0;
  currentPage: number = 1;
  pageSize: number = 12;

  constructor(
    private marketplaceService: MarketplaceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categories = this.marketplaceService.getCategories().slice(0, 6);
  }

  loadProducts() {
    // Загружаем товары из разных категорий для главной страницы
    const allProducts: Product[] = [];
    const categoriesIds = ['electronics', 'clothes', 'home', 'beauty', 'kids', 'food'];
    let loadedCount = 0;

    categoriesIds.forEach(catId => {
      this.marketplaceService.getProductsByCategory(catId).subscribe(products => {
        allProducts.push(...products.slice(0, 2));
        loadedCount++;
        if (loadedCount === categoriesIds.length) {
          this.products = allProducts;
          this.filteredProducts = allProducts;
          this.totalProducts = allProducts.length;
        }
      });
    });
  }

  loadMoreProducts() {
    this.currentPage++;
    const newProducts = this.products.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
    this.filteredProducts = [...this.filteredProducts, ...newProducts];
  }

  onSearch(event: any) {
    if (!this.searchQuery) {
      this.filteredProducts = this.products;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.title.toLowerCase().includes(query) ||
      (product.description?.toLowerCase().includes(query) ?? false)
    );
  }

  selectCategory(category: Category) {
    this.router.navigate(['/marketplace/products', category.id]);
  }

  viewProductDetails(product: Product) {
    this.marketplaceService.addToRecentlyViewed(product);
    this.router.navigate(['/marketplace/product', product.id]);
  }

  toggleFavorite(product: Product, event: Event) {
    event.stopPropagation();
    this.marketplaceService.addToFavorites(product);
  }

  isFavorite(productId: string): boolean {
    return this.marketplaceService.isFavorite(productId);
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    this.marketplaceService.addToCart(product, 1);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  }

  scrollToProducts() {
    this.content?.scrollToPoint(0, 400, 500);
  }
}
