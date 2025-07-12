// 监听获取选中文本的请求
// 添加获取店铺信息的函数
function getShopName() {
    // 方法1：通过文本内容匹配
    const elements = document.querySelectorAll('span');
    for (const element of elements) {
        const text = element.textContent.trim();
        if (text === 'Tongzhou Shoe Industry') return '通洲2';
        if (text === 'JIAN MIN SHOES AND CLOTHING') return '建闽1';
        if (text === 'XiaoQu Kids Shoes') return '晓漆3';
        if (text === 'JianHui Shoes') return '建微4';
    }
    
    // 方法2：如果方法1失败，尝试在特定区域查找
    const headerArea = document.querySelector('header') || document.querySelector('.header-area');
    if (headerArea) {
        const spans = headerArea.querySelectorAll('span');
        for (const span of spans) {
            const text = span.textContent.trim();
            if (text === 'Tongzhou Shoe Industry') return '通洲2';
            if (text === 'JIAN MIN SHOES AND CLOTHING') return '建闽1';
            if (text === 'XiaoQu Kids Shoes') return '晓漆3';
            if (text === 'JianHui Shoes') return '建微4';
        }
    }
    
    return '未知店铺'; // 默认返回值
}

// 修改消息监听器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSelection") {
        try {
            const selectionText = window.getSelection().toString();
            const shopName = getShopName(); // 获取店铺信息
            console.log(shopName)
            console.log("获取到选中文本:", selectionText);
            console.log("店铺名称:", shopName);
            sendResponse({ selectionText, shopName });
        } catch (error) {
            console.error("获取文本错误:", error);
            sendResponse({ error: error.message });
        }
        return true;
    }
});