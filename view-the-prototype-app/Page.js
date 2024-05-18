export default function Page(container) {
  if (!container) {
    throw new Error("Не передан контейнер");
  }
  this.container = container;
  this.getComponentElement();
  this.setBtnEvent();
}

Object.assign(Page.prototype, {
  getComponentElement() {
    const $title = this.createTitle(
      "Просмотр полной цепочки прототипов для любого класса, который содержится в глобальном объекте window"
    );

    const $form = document.createElement("form");
    $form.classList.add("form");

    const $label = document.createElement("label");
    $label.classList.add("form__label");

    const $input = document.createElement("input");
    $input.classList.add("form__input");
    $input.type = "search";
    $input.name = "text";
    $input.autocomplete = "off";
    $input.placeholder = "Название класса";

    const $btn = document.createElement("button");
    $btn.classList.add("btn-reset", "form__btn");
    $btn.type = "submit";
    $btn.textContent = "Показать цепочку прототипов";

    $label.append($input);
    $form.append($label, $btn);

    this.container.append($title, $form);

    this.$input = $input;
    this.$btn = $btn;
  },

  setBtnEvent() {
    if ((!this.$btn && !this.$input) || (this.$btn && !this.$input)) {
      return;
    }

    this.$btn.addEventListener("click", (event) => {
      event.preventDefault();

      this.findAndDelete("hero__list");

      const value = this.$input.value.trim();

      if (value) {
        this.testClassName = value;
        this.getTestClassName();
      } else {
        this.showError = "Поле не может быть пустым";
      }
    });
  },

  getTestClassName() {
    if (!this.testClassName) {
      throw new Error("Не существует названия для проверки");
    }

    if (this.testClassName.endsWith(".js")) {
      this.testImportJs(this.testClassName);
      return;
    }

    if (!(this.testClassName in window)) {
      this.showError = 'Window не содержит "' + this.testClassName + '"';
      return;
    }

    this.testClass = window[this.testClassName];
    this.getPrototypeChain();
  },
  getPrototypeChain() {
    if (typeof this.testClass !== "function") {
      this.showError = this.testClassName + " не является классом или функцией";
      return;
    }

    this.showError = null;

    const $list = this.createList();

    if (this.testClassName === "Object") {
      $list.append(this.renderItemViewPrototype(this.testClass));
      this.container.append($list);
      return;
    }

    while (this.testClass !== Object.getPrototypeOf(Object)) {
      $list.append(this.renderItemViewPrototype(this.testClass));
      this.testClass = Object.getPrototypeOf(this.testClass);
    }

    if (this.testClass === Object.getPrototypeOf(Object)) {
      $list.append(
        this.renderItemViewPrototype(Object.getPrototypeOf(this.testClass))
      );
    }

    this.container.append($list);
  },
  async testImportJs(text) {
    if (typeof text !== "string") {
      throw new TypeError("Аргумент должен быть строкой");
    }

    const module = await import(`./${text}`).catch((error) => {
      if (error.name === "TypeError") {
        this.showError =
          "В папке view-the-prototype-app не существует файла с названием " +
          text;
      } else {
        throw error;
      }
    });

    if (!module) {
      return;
    }

    if (!module.default) {
      this.showError = "Файл " + text + " не содержит export по умолчанию";
      return;
    }

    this.testClass = module.default;
    this.getPrototypeChain();
  },
  renderItemViewPrototype(data) {
    const $item = this.createItem();

    let propertyName;
    if (data.prototype && data.prototype.constructor.name) {
      propertyName = data.prototype.constructor.name;
    } else if (data.constructor && data.constructor.name) {
      propertyName = data.constructor.name;
    } else {
      propertyName = "Без названия";
    }

    const $title = this.createTitle(propertyName, true);
    $item.append($title);

    if (data.prototype) {
      const elements = Object.keys(data.prototype);

      if (elements.length > 0) {
        $item.append(this.createSpan("Перечислимые свойства:"));

        const $sublist = this.createList(true);

        elements.forEach((element) => {
          const $subitem = this.createItem(true);
          $subitem.textContent = `${element}, typeof = ${typeof Object.getOwnPropertyDescriptor(
            data.prototype,
            element
          ).value}`;

          $sublist.append($subitem);
        });

        $item.append($sublist);
      }
    }

    return $item;
  },
  createSpan(text) {
    if (typeof text !== "string") {
      throw new TypeError("Аргумент должен быть строкой");
    }
    const $span = document.createElement("span");
    $span.classList.add("hero__span");
    $span.textContent = text;

    return $span;
  },
  createTitle(text = "Заголовок", subtitle = false) {
    if (typeof text !== "string") {
      throw new TypeError("Аргумент должен быть строкой");
    }

    let $title;

    if (!subtitle) {
      $title = document.createElement("h1");
      $title.classList.add("text-reset", "hero__title");
    } else {
      $title = document.createElement("h2");
      $title.classList.add("text-reset", "hero__subtitle");
    }

    $title.textContent = text;

    return $title;
  },
  createList(sublist = false) {
    const $list = document.createElement("ol");

    if (!sublist) {
      $list.classList.add("list-reset", "hero__list");
    } else {
      $list.classList.add("list-reset", "hero__sublist");
    }

    return $list;
  },
  createItem(subitem = false) {
    const $item = document.createElement("li");

    if (!subitem) {
      $item.classList.add("hero__item");
    } else {
      $item.classList.add("hero__subitem");
    }

    return $item;
  },
  findAndDelete(element) {
    if (typeof element !== "string") {
      throw new TypeError("Аргумент должен быть строкой");
    }

    const $element = this.container.querySelector(`.${element}`);

    if ($element) {
      $element.remove();
    }
  },
});

Object.defineProperty(Page.prototype, "showError", {
  set(text) {
    if (!this.$input) {
      return;
    }

    if (text) {
      if (!this.$errorDesc) {
        const $errorDesc = document.createElement("span");
        $errorDesc.classList.add("form__error");

        this.$input.after($errorDesc);

        this.$errorDesc = $errorDesc;
      }

      if (!this.$input.classList.contains("error")) {
        this.$input.classList.add("error");
      }

      this.$errorDesc.textContent = text;
    } else {
      if (this.$input.classList.contains("error")) {
        this.$input.classList.remove("error");
      }

      if (this.$errorDesc) {
        this.$errorDesc.remove();
        this.$errorDesc = null;
      }
    }
  },
});
