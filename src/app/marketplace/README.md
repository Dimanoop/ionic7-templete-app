Компоненты marketplace

Описание
- `app-product` — карточка товара.

Inputs
- `product: Product` — объект товара (id, title, description, price, currency, oldPrice, rating, reviews, image, badge, seller)
- `showActions: boolean` — показывать кнопки действий.

Outputs
- `addToCart` — событие при добавлении в корзину, возвращает объект product
- `viewDetails` — событие при нажатии "Подробнее"

Как использовать

<app-product [product]="product" (addToCart)="onAddToCart($event)" (viewDetails)="onViewDetails($event)"></app-product>

Примечание
- Для продакшена замените mock-данные на реальные из вашего API или сервиса корзины.
