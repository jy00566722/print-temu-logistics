function findCurrentShopName() {
    const elements = document.querySelectorAll('span');
    for (const element of elements) {
        const text = element.textContent.trim();
        if (text) return text;
    }

    const headerArea = document.querySelector('header') || document.querySelector('.header-area');
    if (headerArea) {
        const spans = headerArea.querySelectorAll('span');
        for (const span of spans) {
            const text = span.textContent.trim();
            if (text) return text;
        }
    }

    return '';
}

function getShopCode(callback) {
    const pageText = Array.from(document.querySelectorAll('span'))
        .map((element) => element.textContent.trim())
        .filter(Boolean);

    ShopConfig.loadMappings((mappings) => {
        const match = mappings.find((shop) => pageText.includes(shop.shopName));
        callback({
            shopName: match ? match.code : '未知店铺',
            detectedShopName: match ? match.shopName : findCurrentShopName()
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSelection") {
        try {
            const selectionText = window.getSelection().toString();
            getShopCode(({ shopName, detectedShopName }) => {
                console.log("获取到选中文本:", selectionText);
                console.log("店铺名称:", shopName);
                sendResponse({ selectionText, shopName, detectedShopName });
            });
        } catch (error) {
            console.error("获取文本错误:", error);
            sendResponse({ error: error.message });
        }
        return true;
    }
});
