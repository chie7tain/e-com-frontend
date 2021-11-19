// dom elements for the app
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
// cart
let url = "http://localhost:3000/api/products";
let cart = [];
// buttons
let buttonsDOM = [];
// getting the products
class Products {
  async getProducts() {
    try {
      let products = await (await fetch(url)).json();
      products = products.map((product) => {
        const {
          id,
          productName: title,
          productDescription: description,
          productVarieties,
        } = product;
        // let varietyId = 0;
        let varieties = productVarieties.map((productVariety) => {
          let varietyId = "_" + Math.random().toString(36).substr(2, 9);
          const { size, color, quantity, images, price } = productVariety;
          productVariety = { varietyId, ...productVariety };
          const image = images[0];
          return {
            varietyId,
            size,
            color,
            quantity,
            image,
            price,
            id,
            title,
            description,
          };
        });
        return {
          id,
          title,
          description,
          varieties,
        };
      });
      return products;
    } catch (error) {
      console.log("error from the get Products method: ", error);
    }
  }
}
// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
      <article class="product">
      <h3>${product.title}</h3>
      <p class="product-description">
      ${product.description}
      </p>
      <section class="product-varieties-container">
      ${product.varieties.map((variety) => {
        let varietyString = "";
        varietyString += `
              <div class="product-variety">
              <div class="product-variety-image-container img-container">
                <img
                  src="${variety.image}"
                  alt=""
                  class="product-variety-image product-img"
                />
                <button class="bag-btn" data-id="${variety.varietyId}">
                  <i class="fas fa-shopping-cart"></i>
                  add to Cart
                </button>
              </div>
              <div class="product-variety-details-container">
                <div class="product-variety-one">
                  <h4 class="product-variety-color">Color: ${variety.color}</h4>
                  <p class="product-variety-price">Price: $${variety.price}</p>
                </div>
                <div class="product-qty">
                  <p class="producty-qty-val">Qty: ${variety.quantity}</p>
                </div>
              </div>
            </div>
            `;
        return varietyString;
      })}
          </section>
        </article>
      `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = btns;
    btns.forEach((btn) => {
      let id = btn.dataset.id;
      let inCart = cart.find((item) => item.varietyId === id);
      if (inCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
    <img src="${item.image}" alt="product">
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id="${item.varietyId}">remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id="${item.varietyId}"></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id="${item.varietyId}"></i>
    </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener("click", (e) => {
      console.log(e.target);
      if (e.target.classList.contains("remove-item")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.varietyId === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }else if (e.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.varietyId === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.varietyId);
    cartItems.forEach((id) => this.removeItem(id));
    console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.varietyId !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    console.log(id);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to Cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    let product = products
      .map((product) => product.varieties)
      .flat()
      .find((product) => product.varietyId === id);
    return product;
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupAPP();
  // get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
