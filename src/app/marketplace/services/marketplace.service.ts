import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category, Product, FilterOptions, CartItem, Review } from '../models/marketplace.models';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  private recentlyViewedSubject = new BehaviorSubject<Product[]>([]);
  public recentlyViewed$ = this.recentlyViewedSubject.asObservable();

  private favoriteSubject = new BehaviorSubject<Product[]>([]);
  public favorites$ = this.favoriteSubject.asObservable();

  private cart: CartItem[] = [];
  private recentlyViewed: Product[] = [];
  private favorites: Product[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // ===== CATEGORIES =====
  getCategories(): Category[] {
    return [
      {
        id: 'electronics',
        name: 'Электроника',
        icon: 'phone-portrait-outline',
        productCount: 15420,
        description: 'Смартфоны, ноутбуки, фототехника',
        subcategories: this.getElectronicsSubcategories()
      },
      {
        id: 'clothes',
        name: 'Одежда и обувь',
        icon: 'shirt-outline',
        productCount: 28540,
        description: 'Мужская, женская, детская одежда',
        subcategories: this.getClothesSubcategories()
      },
      {
        id: 'home',
        name: 'Дом и сад',
        icon: 'home-outline',
        productCount: 12350,
        description: 'Мебель, декор, инструменты',
        subcategories: this.getHomeSubcategories()
      },
      {
        id: 'beauty',
        name: 'Красота и здоровье',
        icon: 'sparkles-outline',
        productCount: 18760,
        description: 'Косметика, парфюмерия, витамины',
        subcategories: this.getBeautySubcategories()
      },
      {
        id: 'kids',
        name: 'Детские товары',
        icon: 'heart-circle-outline',
        productCount: 9820,
        description: 'Игрушки, одежда, товары для малышей',
        subcategories: this.getKidsSubcategories()
      },
      {
        id: 'food',
        name: 'Продукты питания',
        icon: 'fast-food-outline',
        productCount: 22100,
        description: 'Продукты, напитки, снеки',
        subcategories: this.getFoodSubcategories()
      },
      {
        id: 'auto',
        name: 'Автотовары',
        icon: 'car-outline',
        productCount: 8540,
        description: 'Запчасти, аксессуары, масла',
        subcategories: this.getAutoSubcategories()
      },
      {
        id: 'sports',
        name: 'Спорт и отдых',
        icon: 'bicycle-outline',
        productCount: 14200,
        description: 'Спортивный инвентарь, туризм',
        subcategories: this.getSportsSubcategories()
      },
      {
        id: 'books',
        name: 'Книги',
        icon: 'book-outline',
        productCount: 45320,
        description: 'Художественные, учебные книги',
        subcategories: this.getBooksSubcategories()
      },
      {
        id: 'pets',
        name: 'Зоотовары',
        icon: 'paw-outline',
        productCount: 7650,
        description: 'Корм, игрушки для животных',
        subcategories: this.getPetsSubcategories()
      }
    ];
  }

  private getElectronicsSubcategories(): Category[] {
    return [
      { id: 'smartphones', name: 'Смартфоны и гаджеты', icon: 'phone-portrait-outline', productCount: 3200 },
      { id: 'laptops', name: 'Ноутбуки и компьютеры', icon: 'laptop-outline', productCount: 1850 },
      { id: 'tv', name: 'Телевизоры и видео', icon: 'desktop-outline', productCount: 980 },
      { id: 'cameras', name: 'Фототехника', icon: 'camera-outline', productCount: 750 },
      { id: 'audio', name: 'Аудиотехника', icon: 'volume-high-outline', productCount: 2100 },
      { id: 'games', name: 'Игры и консоли', icon: 'game-controller-outline', productCount: 1540 },
      { id: 'accessories', name: 'Аксессуары', icon: 'cube-outline', productCount: 5000 }
    ];
  }

  private getClothesSubcategories(): Category[] {
    return [
      { id: 'mens-clothes', name: 'Мужская одежда', icon: 'person-outline', productCount: 8900 },
      { id: 'womens-clothes', name: 'Женская одежда', icon: 'person-outline', productCount: 12400 },
      { id: 'kids-clothes', name: 'Детская одежда', icon: 'heart-circle-outline', productCount: 4200 },
      { id: 'shoes', name: 'Обувь', icon: 'footsteps-outline', productCount: 7800 }
    ];
  }

  private getHomeSubcategories(): Category[] {
    return [
      { id: 'furniture', name: 'Мебель', icon: 'bed-outline', productCount: 3400 },
      { id: 'decor', name: 'Декор', icon: 'color-palette-outline', productCount: 5600 },
      { id: 'tools', name: 'Инструменты', icon: 'build-outline', productCount: 2100 },
      { id: 'textiles', name: 'Текстиль и ковры', icon: 'square-outline', productCount: 1250 }
    ];
  }

  private getBeautySubcategories(): Category[] {
    return [
      { id: 'cosmetics', name: 'Косметика', icon: 'sparkles-outline', productCount: 6500 },
      { id: 'perfume', name: 'Парфюмерия', icon: 'water-outline', productCount: 2100 },
      { id: 'skincare', name: 'Уход за кожей', icon: 'leaf-outline', productCount: 5800 },
      { id: 'vitamins', name: 'Витамины и БАДы', icon: 'medical-outline', productCount: 4360 }
    ];
  }

  private getKidsSubcategories(): Category[] {
    return [
      { id: 'toys', name: 'Игрушки', icon: 'heart-circle-outline', productCount: 4200 },
      { id: 'baby-goods', name: 'Товары для малышей', icon: 'bed-outline', productCount: 3100 },
      { id: 'kids-furniture', name: 'Детская мебель', icon: 'chair-outline', productCount: 1520 }
    ];
  }

  private getFoodSubcategories(): Category[] {
    return [
      { id: 'grocery', name: 'Продукты', icon: 'fast-food-outline', productCount: 12000 },
      { id: 'drinks', name: 'Напитки', icon: 'water-outline', productCount: 5400 },
      { id: 'snacks', name: 'Снеки и сладости', icon: 'happy-outline', productCount: 4700 }
    ];
  }

  private getAutoSubcategories(): Category[] {
    return [
      { id: 'parts', name: 'Запчасти', icon: 'car-outline', productCount: 3200 },
      { id: 'accessories-auto', name: 'Аксессуары', icon: 'cube-outline', productCount: 2800 },
      { id: 'oils', name: 'Масла и жидкости', icon: 'water-outline', productCount: 1540 }
    ];
  }

  private getSportsSubcategories(): Category[] {
    return [
      { id: 'sports-equipment', name: 'Спортивный инвентарь', icon: 'bicycle-outline', productCount: 5600 },
      { id: 'fitness', name: 'Фитнес и тренажеры', icon: 'barbell-outline', productCount: 3200 },
      { id: 'tourism', name: 'Туризм и путешествия', icon: 'backpack-outline', productCount: 5400 }
    ];
  }

  private getBooksSubcategories(): Category[] {
    return [
      { id: 'fiction', name: 'Художественная литература', icon: 'book-outline', productCount: 18900 },
      { id: 'education', name: 'Учебная литература', icon: 'school-outline', productCount: 12400 },
      { id: 'reference', name: 'Справочники', icon: 'help-circle-outline', productCount: 14020 }
    ];
  }

  private getPetsSubcategories(): Category[] {
    return [
      { id: 'pet-food', name: 'Корм для животных', icon: 'paw-outline', productCount: 3200 },
      { id: 'pet-toys', name: 'Игрушки для животных', icon: 'heart-circle-outline', productCount: 2150 },
      { id: 'pet-care', name: 'Уход за животными', icon: 'bandage-outline', productCount: 2300 }
    ];
  }

  // ===== PRODUCTS =====
  getProductsByCategory(categoryId: string, filters?: FilterOptions): Observable<Product[]> {
    const products = this.generateMockProducts(categoryId, 30);
    let filtered = products;

    if (filters) {
      filtered = this.applyFilters(products, filters);
    }

    return new Observable(observer => {
      observer.next(filtered);
      observer.complete();
    });
  }

  getProductById(productId: string | number): Observable<Product | undefined> {
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        const product = this.generateMockProduct(productId);
        observer.next(product);
        observer.complete();
      }, 300);
    });
  }

  private generateMockProducts(categoryId: string, count: number): Product[] {
    const products: Product[] = [];
    const brands = ['Samsung', 'Apple', 'Sony', 'LG', 'Xiaomi', 'Huawei', 'OnePlus', 'Motorola'];
    const badges = ['Хит', 'New', 'Акция', 'Популярное'];

    for (let i = 0; i < count; i++) {
      products.push({
        id: `${categoryId}-${i}`,
        title: `${this.getCategoryName(categoryId)} №${i + 1}`,
        description: 'Высокое качество, отличные отзывы покупателей',
        longDescription: 'Это полное описание товара с подробной информацией о характеристиках, преимуществах и применении. Товар прошел проверку качества и готов к доставке.',
        price: Math.floor(Math.random() * 100000) + 1000,
        oldPrice: Math.floor(Math.random() * 150000) + 15000,
        discount: Math.floor(Math.random() * 50),
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviews: Math.floor(Math.random() * 500) + 10,
        image: `/assets/img/product-${Math.floor(Math.random() * 5) + 1}.jpg`,
        images: [
          `/assets/img/product-${Math.floor(Math.random() * 5) + 1}.jpg`,
          `/assets/img/product-${Math.floor(Math.random() * 5) + 1}.jpg`,
          `/assets/img/product-${Math.floor(Math.random() * 5) + 1}.jpg`
        ],
        badge: badges[Math.floor(Math.random() * badges.length)],
        seller: 'Официальный магазин',
        sellerRating: Math.round((Math.random() * 1 + 4) * 10) / 10,
        categoryId: categoryId,
        colors: ['Чёрный', 'Белый', 'Синий', 'Красный'],
        sizes: ['S', 'M', 'L', 'XL'],
        inStock: Math.random() > 0.2,
        brand: brands[Math.floor(Math.random() * brands.length)],
        specifications: [
          { name: 'Материал', value: 'Премиум пластик' },
          { name: 'Гарантия', value: '2 года' },
          { name: 'Страна', value: 'Корея' }
        ],
        delivery: {
          days: Math.floor(Math.random() * 3) + 1,
          price: Math.floor(Math.random() * 500),
          free: Math.random() > 0.5
        },
        reviewsList: this.generateMockReviews(),
        tags: ['популярное', 'качество', 'доставка']
      });
    }

    return products;
  }

  private generateMockProduct(productId: string | number): Product {
    return {
      id: productId,
      title: 'Премиум товар',
      description: 'Высокое качество, отличные отзывы',
      longDescription: `Это полное описание товара с подробной информацией. 
      
Товар включает:
- Высокое качество материалов
- Долгий срок службы
- Гарантия 2 года
- Быстрая доставка

Характеристики:
- Вес: 250 грамм
- Размер: 15 х 10 х 2 см
- Материал: Премиум пластик + алюминий
- Совместимость: iOS 12+, Android 8+`,
      price: 4990,
      oldPrice: 6990,
      discount: 28,
      rating: 4.5,
      reviews: 124,
      image: '/assets/img/product-1.jpg',
      images: [
        '/assets/img/product-1.jpg',
        '/assets/img/product-2.jpg',
        '/assets/img/product-3.jpg',
        '/assets/img/product-4.jpg'
      ],
      badge: 'Хит',
      seller: 'Официальный магазин',
      sellerRating: 4.8,
      categoryId: 'electronics',
      colors: ['Чёрный', 'Белый', 'Синий'],
      sizes: ['S', 'M', 'L', 'XL'],
      inStock: true,
      brand: 'Samsung',
      specifications: [
        { name: 'Материал', value: 'Премиум пластик + алюминий' },
        { name: 'Размеры', value: '15 × 10 × 2 см' },
        { name: 'Вес', value: '250 г' },
        { name: 'Гарантия', value: '2 года' },
        { name: 'Страна производства', value: 'Корея' },
        { name: 'Совместимость', value: 'iOS 12+, Android 8+' }
      ],
      delivery: {
        days: 1,
        price: 0,
        free: true
      },
      reviewsList: this.generateMockReviews(),
      tags: ['популярное', 'качество', 'хит продаж']
    };
  }

  private generateMockReviews(): Review[] {
    return [
      {
        id: '1',
        author: 'Иван Петров',
        avatar: '👨‍💼',
        rating: 5,
        date: '2025-11-15',
        text: 'Отличный товар! Быстро пришёл, всё работает идеально. Рекомендую!',
        helpful: 45,
        notHelpful: 2
      },
      {
        id: '2',
        author: 'Мария Сидорова',
        avatar: '👩‍💼',
        rating: 4,
        date: '2025-11-10',
        text: 'Хороший товар, но упаковка могла быть получше.',
        helpful: 32,
        notHelpful: 5
      },
      {
        id: '3',
        author: 'Сергей Козлов',
        avatar: '👨‍💼',
        rating: 5,
        date: '2025-11-05',
        text: 'Лучшее соотношение цены и качества. Спасибо продавцу за быструю доставку!',
        helpful: 67,
        notHelpful: 1
      },
      {
        id: '4',
        author: 'Екатерина Волкова',
        avatar: '👩‍💼',
        rating: 4,
        date: '2025-10-28',
        text: 'Нормально, но есть небольшие недостатки',
        helpful: 18,
        notHelpful: 8
      }
    ];
  }

  private applyFilters(products: Product[], filters: FilterOptions): Product[] {
    let filtered = [...products];

    if (filters.priceFrom !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.priceFrom!);
    }

    if (filters.priceTo !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.priceTo!);
    }

    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(p => p.brand && filters.brands!.includes(p.brand));
    }

    if (filters.rating !== undefined) {
      filtered = filtered.filter(p => (p.rating || 0) >= filters.rating!);
    }

    if (filters.inStock) {
      filtered = filtered.filter(p => p.inStock);
    }

    if (filters.sortBy) {
      filtered = this.sortProducts(filtered, filters.sortBy);
    }

    return filtered;
  }

  private sortProducts(products: Product[], sortBy: string): Product[] {
    const sorted = [...products];

    switch (sortBy) {
      case 'popularity':
        return sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'priceLow':
        return sorted.sort((a, b) => a.price - b.price);
      case 'priceHigh':
        return sorted.sort((a, b) => b.price - a.price);
      case 'new':
        return sorted.reverse();
      default:
        return sorted;
    }
  }

  private getCategoryName(categoryId: string): string {
    const categoryNames: { [key: string]: string } = {
      'electronics': 'Электроника',
      'clothes': 'Одежда',
      'home': 'Дом и сад',
      'beauty': 'Красота',
      'kids': 'Детские товары',
      'food': 'Продукты',
      'auto': 'Автотовары',
      'sports': 'Спорт',
      'books': 'Книги',
      'pets': 'Зоотовары'
    };
    return categoryNames[categoryId] || 'Товар';
  }

  // ===== CART =====
  addToCart(product: Product, quantity: number = 1, variant?: any): void {
    const existingItem = this.cart.find(
      item => item.product.id === product.id && 
               JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({ product, quantity, selectedVariant: variant });
    }

    this.cartSubject.next([...this.cart]);
    this.saveToStorage();
  }

  removeFromCart(productId: string | number): void {
    this.cart = this.cart.filter(item => item.product.id !== productId);
    this.cartSubject.next([...this.cart]);
    this.saveToStorage();
  }

  getCartItems(): CartItem[] {
    return [...this.cart];
  }

  // ===== FAVORITES =====
  addToFavorites(product: Product): void {
    if (!this.favorites.find(p => p.id === product.id)) {
      this.favorites.push({ ...product, favorite: true });
      this.favoriteSubject.next([...this.favorites]);
      this.saveToStorage();
    }
  }

  removeFromFavorites(productId: string | number): void {
    this.favorites = this.favorites.filter(p => p.id !== productId);
    this.favoriteSubject.next([...this.favorites]);
    this.saveToStorage();
  }

  isFavorite(productId: string | number): boolean {
    return this.favorites.some(p => p.id === productId);
  }

  // ===== RECENTLY VIEWED =====
  addToRecentlyViewed(product: Product): void {
    this.recentlyViewed = this.recentlyViewed.filter(p => p.id !== product.id);
    this.recentlyViewed.unshift(product);
    if (this.recentlyViewed.length > 20) {
      this.recentlyViewed.pop();
    }
    this.recentlyViewedSubject.next([...this.recentlyViewed]);
    this.saveToStorage();
  }

  getRecentlyViewed(): Product[] {
    return [...this.recentlyViewed];
  }

  // ===== STORAGE =====
  private saveToStorage(): void {
    try {
      localStorage.setItem('marketplace_cart', JSON.stringify(this.cart));
      localStorage.setItem('marketplace_favorites', JSON.stringify(this.favorites));
      localStorage.setItem('marketplace_viewed', JSON.stringify(this.recentlyViewed));
    } catch (e) {
      console.error('Error saving to storage:', e);
    }
  }

  private loadFromStorage(): void {
    try {
      const cart = localStorage.getItem('marketplace_cart');
      const favorites = localStorage.getItem('marketplace_favorites');
      const viewed = localStorage.getItem('marketplace_viewed');

      if (cart) this.cart = JSON.parse(cart);
      if (favorites) this.favorites = JSON.parse(favorites);
      if (viewed) this.recentlyViewed = JSON.parse(viewed);

      this.cartSubject.next([...this.cart]);
      this.favoriteSubject.next([...this.favorites]);
      this.recentlyViewedSubject.next([...this.recentlyViewed]);
    } catch (e) {
      console.error('Error loading from storage:', e);
    }
  }
}
