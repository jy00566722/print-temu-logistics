const shopList = document.getElementById("shopList");
const addShopButton = document.getElementById("addShop");
const saveShopsButton = document.getElementById("saveShops");
const resetShopsButton = document.getElementById("resetShops");
const statusElement = document.getElementById("status");

let mappings = [];

function setStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.style.color = isError ? "#b42318" : "#276749";
}

function createShopRow(shop) {
    const row = document.createElement("div");
    row.className = `shop-row${shop.locked ? " locked" : ""}`;
    row.dataset.id = shop.id;
    row.dataset.locked = shop.locked ? "true" : "false";

    const nameInput = document.createElement("input");
    nameInput.className = "shop-name";
    nameInput.placeholder = "页面店铺名称";
    nameInput.value = shop.shopName;
    nameInput.disabled = Boolean(shop.locked);

    const codeInput = document.createElement("input");
    codeInput.className = "shop-code";
    codeInput.placeholder = "代号";
    codeInput.value = shop.code;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "删";
    deleteButton.className = "danger";
    deleteButton.disabled = Boolean(shop.locked);
    deleteButton.title = shop.locked ? "默认店铺不能删除" : "删除店铺";
    deleteButton.addEventListener("click", () => {
        row.remove();
        setStatus("");
    });

    row.append(nameInput, codeInput, deleteButton);
    return row;
}

function render() {
    shopList.innerHTML = "";
    mappings.forEach((shop) => {
        shopList.appendChild(createShopRow(shop));
    });
}

function readRows() {
    return Array.from(shopList.querySelectorAll(".shop-row")).map((row, index) => {
        const locked = row.dataset.locked === "true";
        const shopName = row.querySelector(".shop-name").value.trim();
        const code = row.querySelector(".shop-code").value.trim();

        return {
            id: row.dataset.id || `custom-${Date.now()}-${index}`,
            shopName,
            code,
            locked
        };
    });
}

function validate(rows) {
    const invalidRow = rows.find((shop) => !shop.shopName || !shop.code);
    if (invalidRow) {
        return "店铺名称和代号都不能为空。";
    }

    const names = rows.map((shop) => shop.shopName);
    const duplicateName = names.find((name, index) => names.indexOf(name) !== index);
    if (duplicateName) {
        return `店铺名称重复：${duplicateName}`;
    }

    return "";
}

function load() {
    ShopConfig.loadMappings((loadedMappings) => {
        mappings = loadedMappings;
        render();
    });
}

addShopButton.addEventListener("click", () => {
    mappings = readRows();
    mappings.push({
        id: `custom-${Date.now()}`,
        shopName: "",
        code: "",
        locked: false
    });
    render();
    setStatus("已添加一行新店铺。");
});

saveShopsButton.addEventListener("click", () => {
    const rows = readRows();
    const error = validate(rows);
    if (error) {
        setStatus(error, true);
        return;
    }

    ShopConfig.saveMappings(rows, (savedMappings) => {
        mappings = savedMappings;
        render();
        setStatus("配置已保存。");
    });
});

resetShopsButton.addEventListener("click", () => {
    ShopConfig.resetMappings((defaultMappings) => {
        mappings = defaultMappings;
        render();
        setStatus("已恢复默认配置。");
    });
});

load();
