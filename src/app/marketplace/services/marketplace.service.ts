import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  private productsCache: any = null;
  private categoriesCache: Category[] = [];
  private idCounter: number = 1;
  private idMap: { [originalId: string]: number } = {};

  constructor(private http: HttpClient) {
    this.loadFromStorage();
    this.loadProductsData();
  }

  private processLoadedData(data: any): void {
    // If the JSON already contains numeric ids, keep them and set idCounter after max id.
    const rawProducts: any[] = (data.products || []);
    const allNumeric = rawProducts.every(p => typeof p.id === 'number');
    if (allNumeric) {
      const products = rawProducts;
      const maxId = products.reduce((m, p) => Math.max(m, Number(p.id)), 0);
      this.idCounter = Math.max(this.idCounter, maxId + 1);
      // clear idMap because ids are stable numeric now
      this.idMap = {};
      this.productsCache = { ...data, products };
      console.debug('[MarketplaceService] processLoadedData: loaded products count', this.productsCache.products.length);
      this.categoriesCache = data.categories || [];
      // Ensure loaded categories include nameKey for translation fallback
      this.categoriesCache = this.categoriesCache.map((c: any) => this.withNameKey(c));
    } else {
      // Assign numeric ids to loaded products to ensure unique incremental ids
      const products = rawProducts.map((p: any) => {
        const originalId = p.id != null ? String(p.id) : `gen-${this.idCounter}`;
        const newId = this.idCounter++;
        this.idMap[originalId] = newId;
        return { ...p, id: newId };
      });
      this.productsCache = { ...data, products };
      console.debug('[MarketplaceService] processLoadedData: loaded products count', this.productsCache.products.length);
      this.categoriesCache = data.categories || [];
      // Ensure loaded categories include nameKey for translation fallback
      this.categoriesCache = this.categoriesCache.map((c: any) => this.withNameKey(c));
    }
  }

  private sanitizeKey(id: string): string {
    return String(id || '').replace(/[^A-Za-z0-9]+/g, '_').toUpperCase();
  }

  private withNameKey(cat: any): any {
    if (!cat) return cat;
    // Top-level category key
    if (!cat.nameKey) {
      cat.nameKey = `MARKETPLACE.CATEGORY.${this.sanitizeKey(cat.id)}`;
    }
    // Ensure subcategories have nameKey too
    if (cat.subcategories && Array.isArray(cat.subcategories)) {
      cat.subcategories = cat.subcategories.map((sub: any) => {
        if (!sub.nameKey) {
          const parentKey = this.sanitizeKey(cat.id);
          const childKey = this.sanitizeKey(sub.id || sub.name);
          sub.nameKey = `MARKETPLACE.CATEGORY.${parentKey}_${childKey}`;
        }
        return sub;
      });
    }
    return cat;
  }

  private loadProductsData(): void {
    this.http.get('/assets/sample-data/marketplace/products.json').subscribe(
      (data: any) => {
        try {
          this.processLoadedData(data);
        } catch (e) {
          console.error('Error processing products data:', e);
        }
      },
      (error) => {
        console.error('Error loading products data:', error);
      }
    );
  }

  // Public method to reload products at runtime and return an observable that completes when done
  public reloadProducts(): Observable<void> {
    return this.http.get('/assets/sample-data/marketplace/products.json').pipe(
      map((data: any) => {
        this.processLoadedData(data);
        return;
      })
    );
  }

  // ===== CATEGORIES =====
  getCategories(): Category[] {
    if (this.categoriesCache.length > 0) {
      return this.categoriesCache;
    }
    // Fallback to default categories if not loaded yet
    return this.getDefaultCategories();
  }

  private getDefaultCategories(): Category[] {
    return [
      {
        id: 'electronics',
        name: 'Электроника',
        nameKey: 'MARKETPLACE.CATEGORY.ELECTRONICS',
        icon: 'phone-portrait-outline',
        productCount: 15420,
        description: 'Смартфоны, ноутбуки, фототехника',
        subcategories: this.getElectronicsSubcategories()
      },
      {
        id: 'clothes',
        name: 'Одежда и обувь',
        nameKey: 'MARKETPLACE.CATEGORY.CLOTHES',
        icon: 'shirt-outline',
        productCount: 28540,
        description: 'Мужская, женская, детская одежда',
        subcategories: this.getClothesSubcategories()
      },
      {
        id: 'home',
        name: 'Дом и сад',
        nameKey: 'MARKETPLACE.CATEGORY.HOME',
        icon: 'home-outline',
        productCount: 12350,
        description: 'Мебель, декор, инструменты',
        subcategories: this.getHomeSubcategories()
      },
      {
        id: 'beauty',
        name: 'Красота и здоровье',
        nameKey: 'MARKETPLACE.CATEGORY.BEAUTY',
        icon: 'sparkles-outline',
        productCount: 18760,
        description: 'Косметика, парфюмерия, витамины',
        subcategories: this.getBeautySubcategories()
      },
      {
        id: 'kids',
        name: 'Детские товары',
        nameKey: 'MARKETPLACE.CATEGORY.KIDS',
        icon: 'heart-circle-outline',
        productCount: 9820,
        description: 'Игрушки, одежда, товары для малышей',
        subcategories: this.getKidsSubcategories()
      },
      {
        id: 'food',
        name: 'Продукты питания',
        nameKey: 'MARKETPLACE.CATEGORY.FOOD',
        icon: 'fast-food-outline',
        productCount: 22100,
        description: 'Продукты, напитки, снеки',
        subcategories: this.getFoodSubcategories()
      },
      {
        id: 'auto',
        name: 'Автотовары',
        nameKey: 'MARKETPLACE.CATEGORY.AUTO',
        icon: 'car-outline',
        productCount: 8540,
        description: 'Запчасти, аксессуары, масла',
        subcategories: this.getAutoSubcategories()
      },
      {
        id: 'sports',
        name: 'Спорт и отдых',
        nameKey: 'MARKETPLACE.CATEGORY.SPORTS',
        icon: 'bicycle-outline',
        productCount: 14200,
        description: 'Спортивный инвентарь, туризм',
        subcategories: this.getSportsSubcategories()
      },
      {
        id: 'books',
        name: 'Книги',
        nameKey: 'MARKETPLACE.CATEGORY.BOOKS',
        icon: 'book-outline',
        productCount: 45320,
        description: 'Художественные, учебные книги',
        subcategories: this.getBooksSubcategories()
      },
      {
        id: 'pets',
        name: 'Зоотовары',
        nameKey: 'MARKETPLACE.CATEGORY.PETS',
        icon: 'paw-outline',
        productCount: 7650,
        description: 'Корм, игрушки для животных',
        subcategories: this.getPetsSubcategories()
      }
    ];
  }

  private getElectronicsSubcategories(): Category[] {
    return [
      { id: 'smartphones', name: 'Смартфоны и гаджеты', nameKey: 'MARKETPLACE.CATEGORY.ELECTRONICS_SMARTPHONES', icon: 'phone-portrait-outline', productCount: 3200 },
      { id: 'laptops', name: 'Ноутбуки и компьютеры', nameKey: 'MARKETPLACE.CATEGORY.ELECTRONICS_LAPTOPS', icon: 'laptop-outline', productCount: 1850 },
      { id: 'tv', name: 'Телевизоры и видео', nameKey: 'MARKETPLACE.CATEGORY.ELECTRONICS_TV', icon: 'desktop-outline', productCount: 980 },
      { id: 'cameras', name: 'Фототехника', nameKey: 'MARKETPLACE.CATEGORY.ELECTRONICS_CAMERAS', icon: 'camera-outline', productCount: 750 },
      { id: 'audio', name: 'Аудиотехника', nameKey: 'MARKETPLACE.CATEGORY.ELECTRONICS_AUDIO', icon: 'volume-high-outline', productCount: 2100 },
      { id: 'games', name: 'Игры и консоли', nameKey: 'MARKETPLACE.CATEGORY.ELECTRONICS_GAMES', icon: 'game-controller-outline', productCount: 1540 },
      { id: 'accessories', name: 'Аксессуары', nameKey: 'MARKETPLACE.CATEGORY.ELECTRONICS_ACCESSORIES', icon: 'cube-outline', productCount: 5000 }
    ];
  }

  private getClothesSubcategories(): Category[] {
    return [
      { id: 'mens-clothes', name: 'Мужская одежда', nameKey: 'MARKETPLACE.CATEGORY.CLOTHES_MENS_CLOTHES', icon: 'person-outline', productCount: 8900 },
      { id: 'womens-clothes', name: 'Женская одежда', nameKey: 'MARKETPLACE.CATEGORY.CLOTHES_WOMENS_CLOTHES', icon: 'person-outline', productCount: 12400 },
      { id: 'kids-clothes', name: 'Детская одежда', nameKey: 'MARKETPLACE.CATEGORY.CLOTHES_KIDS_CLOTHES', icon: 'heart-circle-outline', productCount: 4200 },
      { id: 'shoes', name: 'Обувь', nameKey: 'MARKETPLACE.CATEGORY.CLOTHES_SHOES', icon: 'footsteps-outline', productCount: 7800 }
    ];
  }

  private getHomeSubcategories(): Category[] {
    return [
      { id: 'furniture', name: 'Мебель', nameKey: 'MARKETPLACE.CATEGORY.HOME_FURNITURE', icon: 'bed-outline', productCount: 3400 },
      { id: 'decor', name: 'Декор', nameKey: 'MARKETPLACE.CATEGORY.HOME_DECOR', icon: 'color-palette-outline', productCount: 5600 },
      { id: 'tools', name: 'Инструменты', nameKey: 'MARKETPLACE.CATEGORY.HOME_TOOLS', icon: 'build-outline', productCount: 2100 },
      { id: 'textiles', name: 'Текстиль и ковры', nameKey: 'MARKETPLACE.CATEGORY.HOME_TEXTILES', icon: 'square-outline', productCount: 1250 }
    ];
  }

  private getBeautySubcategories(): Category[] {
    return [
      { id: 'cosmetics', name: 'Косметика', nameKey: 'MARKETPLACE.CATEGORY.BEAUTY_COSMETICS', icon: 'sparkles-outline', productCount: 6500 },
      { id: 'perfume', name: 'Парфюмерия', nameKey: 'MARKETPLACE.CATEGORY.BEAUTY_PERFUME', icon: 'water-outline', productCount: 2100 },
      { id: 'skincare', name: 'Уход за кожей', nameKey: 'MARKETPLACE.CATEGORY.BEAUTY_SKINCARE', icon: 'leaf-outline', productCount: 5800 },
      { id: 'vitamins', name: 'Витамины и БАДы', nameKey: 'MARKETPLACE.CATEGORY.BEAUTY_VITAMINS', icon: 'medical-outline', productCount: 4360 }
    ];
  }

  private getKidsSubcategories(): Category[] {
    return [
      { id: 'toys', name: 'Игрушки', nameKey: 'MARKETPLACE.CATEGORY.KIDS_TOYS', icon: 'heart-circle-outline', productCount: 4200 },
      { id: 'baby-goods', name: 'Товары для малышей', nameKey: 'MARKETPLACE.CATEGORY.KIDS_BABY_GOODS', icon: 'bed-outline', productCount: 3100 },
      { id: 'kids-furniture', name: 'Детская мебель', nameKey: 'MARKETPLACE.CATEGORY.KIDS_FURNITURE', icon: 'chair-outline', productCount: 1520 }
    ];
  }

  private getFoodSubcategories(): Category[] {
    return [
      { id: 'grocery', name: 'Продукты', nameKey: 'MARKETPLACE.CATEGORY.FOOD_GROCERY', icon: 'fast-food-outline', productCount: 12000 },
      { id: 'drinks', name: 'Напитки', nameKey: 'MARKETPLACE.CATEGORY.FOOD_DRINKS', icon: 'water-outline', productCount: 5400 },
      { id: 'snacks', name: 'Снеки и сладости', nameKey: 'MARKETPLACE.CATEGORY.FOOD_SNACKS', icon: 'happy-outline', productCount: 4700 }
    ];
  }

  private getAutoSubcategories(): Category[] {
    return [
      { id: 'parts', name: 'Запчасти', nameKey: 'MARKETPLACE.CATEGORY.AUTO_PARTS', icon: 'car-outline', productCount: 3200 },
      { id: 'accessories-auto', name: 'Аксессуары', nameKey: 'MARKETPLACE.CATEGORY.AUTO_ACCESSORIES', icon: 'cube-outline', productCount: 2800 },
      { id: 'oils', name: 'Масла и жидкости', nameKey: 'MARKETPLACE.CATEGORY.AUTO_OILS', icon: 'water-outline', productCount: 1540 }
    ];
  }

  private getSportsSubcategories(): Category[] {
    return [
      { id: 'sports-equipment', name: 'Спортивный инвентарь', nameKey: 'MARKETPLACE.CATEGORY.SPORTS_EQUIPMENT', icon: 'bicycle-outline', productCount: 5600 },
      { id: 'fitness', name: 'Фитнес и тренажеры', nameKey: 'MARKETPLACE.CATEGORY.SPORTS_FITNESS', icon: 'barbell-outline', productCount: 3200 },
      { id: 'tourism', name: 'Туризм и путешествия', nameKey: 'MARKETPLACE.CATEGORY.SPORTS_TOURISM', icon: 'backpack-outline', productCount: 5400 }
    ];
  }

  private getBooksSubcategories(): Category[] {
    return [
      { id: 'fiction', name: 'Художественная литература', nameKey: 'MARKETPLACE.CATEGORY.BOOKS_FICTION', icon: 'book-outline', productCount: 18900 },
      { id: 'education', name: 'Учебная литература', nameKey: 'MARKETPLACE.CATEGORY.BOOKS_EDUCATION', icon: 'school-outline', productCount: 12400 },
      { id: 'reference', name: 'Справочники', nameKey: 'MARKETPLACE.CATEGORY.BOOKS_REFERENCE', icon: 'help-circle-outline', productCount: 14020 }
    ];
  }

  private getPetsSubcategories(): Category[] {
    return [
      { id: 'pet-food', name: 'Корм для животных', nameKey: 'MARKETPLACE.CATEGORY.PETS_FOOD', icon: 'paw-outline', productCount: 3200 },
      { id: 'pet-toys', name: 'Игрушки для животных', nameKey: 'MARKETPLACE.CATEGORY.PETS_TOYS', icon: 'heart-circle-outline', productCount: 2150 },
      { id: 'pet-care', name: 'Уход за животными', nameKey: 'MARKETPLACE.CATEGORY.PETS_CARE', icon: 'bandage-outline', productCount: 2300 }
    ];
  }

  // ===== PRODUCTS =====
  getProductsByCategory(categoryId: string, filters?: FilterOptions, options?: { includeMock?: boolean; limit?: number }): Observable<Product[]> {
    // Загружаем товары из кеша
    if (this.productsCache && this.productsCache.products) {
      let products = this.productsCache.products.filter((p: Product) => p.categoryId === categoryId);

      // If caller requested not to include mock items, return cached products only
      if (options && options.includeMock === false) {
        if (options.limit && products.length > options.limit) {
          products = products.slice(0, options.limit);
        }
        return new Observable(observer => {
          observer.next(products);
          observer.complete();
        });
      }

      // Если товаров мало, добавляем сгенерированные (legacy behavior)
      if (products.length < 10) {
        products = [...products, ...this.generateMockProducts(categoryId, 30 - products.length)];
      }

      let filtered = products;
      if (filters) {
        filtered = this.applyFilters(products, filters);
      }

      return new Observable(observer => {
        observer.next(filtered);
        observer.complete();
      });
    }

    // Fallback: использовать сгенерированные товары
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
      const requested = String(productId);
      const lookup = (): Product | undefined => {
        if (!this.productsCache || !this.productsCache.products) return undefined;
        const numeric = Number(productId);
        let found = this.productsCache.products.find((p: Product) => p.id === numeric);
        if (!found) {
          const mapped = this.idMap[requested];
          if (mapped) {
            found = this.productsCache.products.find((p: Product) => p.id === mapped);
          }
        }
        // Also try matching string ids if any are strings
        if (!found) {
          found = this.productsCache.products.find((p: Product) => String((p as any).id) === requested);
        }
        return found;
      };

      const tryFoundOrFallback = (source: string) => {
        const f = lookup();
        console.debug(`[MarketplaceService] getProductById(${productId}) - lookup from ${source}:`, f ? `found id=${f.id}` : 'not found');
        if (f) {
          (f as any).__lookupSource = source;
          observer.next(f);
          observer.complete();
          return true;
        }
        return false;
      };

      // If we have cached data, try to find immediately
      if (this.productsCache && this.productsCache.products) {
        if (tryFoundOrFallback('cache')) return;
        // no product found in cache -> return generated mock after small delay
        setTimeout(() => {
          console.debug(`[MarketplaceService] getProductById(${productId}) - returning mock fallback`);
          const product = this.generateMockProduct(productId);
          (product as any).__lookupSource = 'mock';
          observer.next(product);
          observer.complete();
        }, 300);
        return;
      }

      // If cache is not ready, try reloading data then lookup again
      console.debug(`[MarketplaceService] getProductById(${productId}) - cache empty, reloading`);
      this.reloadProducts().subscribe(() => {
        if (tryFoundOrFallback('reload')) return;
        // Still not found - return mock product
        console.debug(`[MarketplaceService] getProductById(${productId}) - after reload returning mock fallback`);
        const product = this.generateMockProduct(productId);
        observer.next(product);
        observer.complete();
      }, (err) => {
        console.warn(`[MarketplaceService] reloadProducts failed`, err);
        const product = this.generateMockProduct(productId);
        observer.next(product);
        observer.complete();
      });
    });
  }

  private generateMockProducts(categoryId: string, count: number): Product[] {
    const products: Product[] = [];
    const brands = ['Samsung', 'Apple', 'Sony', 'LG', 'Xiaomi', 'Huawei', 'OnePlus', 'Motorola'];
    const badges = ['Хит', 'New', 'Акция', 'Популярное'];

    for (let i = 0; i < count; i++) {
      const id = this.idCounter++;
      products.push({
        id,
        title: `${this.getCategoryName(categoryId)} №${i + 1}`,
        description: 'Высокое качество, отличные отзывы покупателей',
        longDescription: 'Это полное описание товара с подробной информацией о характеристиках, преимуществах и применении. Товар прошел проверку качества и готов к доставке.',
        price: Math.floor(Math.random() * 100000) + 1000,
        oldPrice: Math.floor(Math.random() * 150000) + 15000,
        discount: Math.floor(Math.random() * 50),
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviews: Math.floor(Math.random() * 500) + 10,
        image: `/assets/sample-images/marketplace/product-${Math.floor(Math.random() * 5) + 1}.jpg`,
        images: [
          `/assets/sample-images/marketplace/product-${Math.floor(Math.random() * 5) + 1}.jpg`,
          `/assets/sample-images/marketplace/product-${Math.floor(Math.random() * 5) + 1}.jpg`,
          `/assets/sample-images/marketplace/product-${Math.floor(Math.random() * 5) + 1}.jpg`
        ],
        badge: badges[Math.floor(Math.random() * badges.length)],
        seller: 'Официальный магазин',
        sellerRating: Math.round((Math.random() * 1 + 4) * 10) / 10,
        categoryId: categoryId,
        colors: ['Чёрный', 'Белый', 'Синий', 'Красный'],
        sizes: (['clothes', 'shoes', 'kids'].includes(categoryId)) ? ['S', 'M', 'L', 'XL'] : [],
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
      image: '/assets/sample-images/marketplace/product-1.jpg',
      images: [
        '/assets/sample-images/marketplace/product-1.jpg',
        '/assets/sample-images/marketplace/product-2.jpg',
        '/assets/sample-images/marketplace/product-3.jpg',
        '/assets/sample-images/marketplace/product-4.jpg'
      ],
      badge: 'Хит',
      seller: 'Официальный магазин',
      sellerRating: 4.8,
      categoryId: 'electronics',
      colors: ['Чёрный', 'Белый', 'Синий'],
      sizes: [],
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
  private normalizeId(id: string | number): string {
    return String(id);
  }
  addToCart(product: Product, quantity: number = 1, variant?: any): void {
    const existingItem = this.cart.find(
      item => this.normalizeId(item.product.id) === this.normalizeId(product.id) &&
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
    this.cart = this.cart.filter(item => this.normalizeId(item.product.id) !== this.normalizeId(productId));
    this.cartSubject.next([...this.cart]);
    this.saveToStorage();
  }

  changeCartItemQuantity(productId: string | number, delta: number): void {
    const item = this.cart.find(i => this.normalizeId(i.product.id) === this.normalizeId(productId));
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.cartSubject.next([...this.cart]);
        this.saveToStorage();
      }
    }
  }

  getCartItemQuantity(productId: string | number): number {
    const item = this.cart.find(i => this.normalizeId(i.product.id) === this.normalizeId(productId));
    return item ? item.quantity : 0;
  }

  getCartItems(): CartItem[] {
    return [...this.cart];
  }

  // ===== FAVORITES =====
  addToFavorites(product: Product): void {
    if (this.isFavorite(product.id)) {
      this.removeFromFavorites(product.id);
    } else {
      this.favorites.push({ ...product, favorite: true });
      this.favoriteSubject.next([...this.favorites]);
      this.saveToStorage();
    }
  }

  removeFromFavorites(productId: string | number): void {
    this.favorites = this.favorites.filter(p => this.normalizeId(p.id) !== this.normalizeId(productId));
    this.favoriteSubject.next([...this.favorites]);
    this.saveToStorage();
  }

  getFavorites(): Observable<Product[]> {
    return this.favorites$;
  }

  isFavorite(productId: string | number): boolean {
    return this.favorites.some(p => this.normalizeId(p.id) === this.normalizeId(productId));
  }

  // ===== RECENTLY VIEWED =====
  addToRecentlyViewed(product: Product): void {
    this.recentlyViewed = this.recentlyViewed.filter(p => this.normalizeId(p.id) !== this.normalizeId(product.id));
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
