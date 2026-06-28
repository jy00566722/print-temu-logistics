(function () {
    const DEFAULT_SHOPS = [
        {
            id: "tongzhou",
            shopName: "Tongzhou Shoe Industry",
            code: "通洲2",
            locked: true
        },
        {
            id: "jianmin",
            shopName: "JIAN MIN SHOES AND CLOTHING",
            code: "建闽1",
            locked: true
        },
        {
            id: "xiaoqu",
            shopName: "XiaoQu Kids Shoes",
            code: "晓漆3",
            locked: true
        },
        {
            id: "jianhui",
            shopName: "JianHui Shoes",
            code: "建微4",
            locked: true
        }
    ];

    const STORAGE_KEY = "shopMappings";

    function cloneDefaults() {
        return DEFAULT_SHOPS.map((shop) => ({ ...shop }));
    }

    function normalizeShop(shop, fallback, index) {
        const base = fallback || {};
        const shopName = String(shop && shop.shopName || base.shopName || "").trim();
        const code = String(shop && shop.code || base.code || "").trim();
        const locked = Boolean(base.locked || shop && shop.locked);
        const id = base.id || shop && shop.id || `custom-${Date.now()}-${index}`;

        return {
            id,
            shopName,
            code,
            locked
        };
    }

    function mergeMappings(storedMappings) {
        const mappings = Array.isArray(storedMappings) ? storedMappings : [];
        const mergedDefaults = DEFAULT_SHOPS.map((defaultShop, index) => {
            const stored = mappings.find((shop) => shop.id === defaultShop.id || shop.shopName === defaultShop.shopName);
            return normalizeShop(stored || defaultShop, defaultShop, index);
        });

        const customMappings = mappings
            .filter((shop) => !DEFAULT_SHOPS.some((defaultShop) => defaultShop.id === shop.id || defaultShop.shopName === shop.shopName))
            .map((shop, index) => normalizeShop(shop, null, index))
            .filter((shop) => shop.shopName && shop.code);

        return mergedDefaults.concat(customMappings);
    }

    function loadMappings(callback) {
        chrome.storage.local.get({ [STORAGE_KEY]: cloneDefaults() }, (result) => {
            callback(mergeMappings(result[STORAGE_KEY]));
        });
    }

    function saveMappings(mappings, callback) {
        const normalized = mergeMappings(mappings);
        chrome.storage.local.set({ [STORAGE_KEY]: normalized }, () => {
            if (callback) callback(normalized);
        });
    }

    function resetMappings(callback) {
        saveMappings(cloneDefaults(), callback);
    }

    self.ShopConfig = {
        DEFAULT_SHOPS: cloneDefaults(),
        STORAGE_KEY,
        loadMappings,
        saveMappings,
        resetMappings
    };
})();
