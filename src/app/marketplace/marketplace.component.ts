import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { MarketplaceService } from './services/marketplace.service';
import { Product, Category } from './models/marketplace.models';
import { TranslateService} from '@ngx-translate/core';

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
  cartQuantities: { [productId: string]: number } = {};

  constructor(
    private marketplaceService: MarketplaceService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    // Ensure products.json is reloaded from disk (useful after editing sample data)
    this.marketplaceService.reloadProducts().subscribe(() => {
      this.loadCategories();
      this.loadProducts();
    }, (err) => {
      // If reload fails, fall back to existing data
      console.warn('Failed to reload products.json, using cached data', err);
      this.loadCategories();
      this.loadProducts();
    });
    this.marketplaceService.cart$.subscribe(items => {
      const map: { [key: string]: number } = {};
      items.forEach(i => {
        map[i.product.id.toString()] = i.quantity;
      });
      this.cartQuantities = map;
    });
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
      // Request only real products for the main page (do not include generated mock items)
      // Do not limit here — show all real cached products from each category on the main page
      this.marketplaceService.getProductsByCategory(catId, undefined, { includeMock: false }).subscribe(products => {
        // Добавляем все реальные товары из этой категории
        products.forEach(product => {
          const copy = { ...product };
          allProducts.push(copy);
        });
        loadedCount++;
        if (loadedCount === categoriesIds.length) {
          // Randomize order of real products on main page
          const shuffled = this.shuffleArray(allProducts);
          this.products = shuffled;
          this.filteredProducts = shuffled;
          this.totalProducts = shuffled.length;
        }
      });
    });
  }

  // Fisher-Yates shuffle
  private shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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
    const isCurrentlyFavorite = this.marketplaceService.isFavorite(product.id);
    if (isCurrentlyFavorite) {
      this.marketplaceService.removeFromFavorites(product.id);
    } else {
      this.marketplaceService.addToFavorites(product);
    }
  }

  isFavorite(productId: string | number): boolean {
    return this.marketplaceService.isFavorite(productId);
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    this.marketplaceService.addToCart(product, 1);
  }

  incrementQuantity(product: Product, event: Event) {
    event.stopPropagation();
    this.marketplaceService.changeCartItemQuantity(product.id, 1);
  }

  decrementQuantity(product: Product, event: Event) {
    event.stopPropagation();
    this.marketplaceService.changeCartItemQuantity(product.id, -1);
  }

  getQuantity(product: Product): number {
    return this.cartQuantities[product.id.toString()] || 0;
  }

  // Helper to get top specs for electronics on the main page
  getElectronicsTopSpecs(product: Product): { name: string; value: string }[] {
    if (!product || !product.specifications || product.categoryId !== 'electronics') return [];
    const keys = ['Процессор', 'ОЗУ', 'Память', 'ПЗУ', 'Накопитель', 'Хранение', 'Объём памяти'];
    return product.specifications.filter(s => keys.includes(s.name)).slice(0, 2);
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

  openCart() {
    this.router.navigate(['/marketplace/cart']);
  }

  openFavorites() {
    this.router.navigate(['/marketplace/favorites']);
  }
}
