importScripts("js/shop-config.js");

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "printOrderInfo",
      title: "打印选中订单信息",
      contexts: ["selection"],
      documentUrlPatterns: ["https://seller.kuajingmaihuo.com/main/order-manager/shipping-list*"]
    });
  });
  
  // 处理右键菜单点击
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "printOrderInfo") {
      chrome.tabs.sendMessage(tab.id, {action: "getSelection"}, (response) => {
        if (chrome.runtime.lastError) {
          showPageNotice(tab.id, "无法读取页面内容，请刷新订单页面后重试。", "error");
          return;
        }
        if (response && response.shopName) {
          // 弹出对话框让用户选择袋数
          chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: () => {
              return prompt("请输入袋数 (1-10):", "1");
            }
          }, (result) => {
            const bagCount = result && result[0] ? result[0].result : null;
            // 验证输入
            if (bagCount && !isNaN(bagCount) && bagCount >= 1 && bagCount <= 10) {
              handleSelectedText(info.selectionText, tab, response.shopName, parseInt(bagCount));
            } else {
              showPageNotice(tab.id, "请输入1-10之间的数字。", "error");
            }
          });
        } else {
          showPageNotice(tab.id, "没有读取到选中内容，请先选中一条订单信息。", "error");
        }
      });
    }
  });
  
  function handleSelectedText(selectedText, tab, shopName, bagCount = 1) {
    console.log("处理选中文本:", selectedText);
    console.log("店铺名称:", shopName);
    console.log("袋数:", bagCount);
    const orderInfo = extractOrderInfoFromText(selectedText);
    
    if (orderInfo) {
        console.log("提取的订单信息:", orderInfo);
        const printContent = generatePrintContent({ ...orderInfo, shopName: shopName, bagCount: bagCount });
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: (content) => {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(content);
                printWindow.document.close();
                printWindow.onload = function() {
                    printWindow.print();
                    setTimeout(() => {
                        // printWindow.close();
                    }, 100);
                };
            },
            args: [printContent]
        });
    } else {
        showPageNotice(tab.id, "解析订单失败：请确认选中的内容包含物流单号、货号、发货数量等订单信息。", "error");
    }
}

function showPageNotice(tabId, message, type = "info") {
    chrome.scripting.executeScript({
        target: {tabId},
        func: (noticeMessage, noticeType) => {
            const existingNotice = document.getElementById("temu-print-extension-notice");
            if (existingNotice) existingNotice.remove();

            const notice = document.createElement("div");
            notice.id = "temu-print-extension-notice";
            notice.textContent = noticeMessage;
            notice.style.position = "fixed";
            notice.style.top = "20px";
            notice.style.right = "20px";
            notice.style.zIndex = "2147483647";
            notice.style.maxWidth = "360px";
            notice.style.padding = "12px 16px";
            notice.style.borderRadius = "6px";
            notice.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.18)";
            notice.style.fontSize = "14px";
            notice.style.lineHeight = "1.5";
            notice.style.fontFamily = "Arial, sans-serif";
            notice.style.color = "#fff";
            notice.style.background = noticeType === "error" ? "#c62828" : "#1565c0";

            document.body.appendChild(notice);
            setTimeout(() => {
                notice.remove();
            }, 4000);
        },
        args: [message, type]
    });
}
  

  function generatePrintContent(info) {
      const productRows = info.products ? info.products.map(product => `
          <tr>
              <td>${product.productCode || ''}</td>
              <td>${product.quantity || ''}</td>
          </tr>
      `).join('') : '';
  
      const totalQuantity = info.products ? info.products.reduce((sum, product) => sum + product.quantity, 0) : 0;
  
      return `<!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <title>TEMU物流单</title>
              <style>
                  @page {
                      size: 10cm 10cm;
                      margin: 0;
                  }
                  body {
                      width: 10cm;
                      height: 10cm;
                      margin: 0;
                      padding: 5mm;
                      font-family: Arial, sans-serif;
                      font-size: 20px;
                  }
                  .order-container {
                      border: 1px solid black;
                      padding: 10px;
                  }
                  .a1{
                      display: flex;
                      justify-content: space-between;
                      
                  }
                  .header {
                      text-align: center;
                      border-bottom: 1px solid black;
                      padding-bottom: 10px;
                      margin-bottom: 10px;
                      font-weight: bold;
                      background-color: black;
                      color: white;
                  }
                  
                  .logNumber{
                      text-align: center;
                      font-weight: bold;
                      margin-left: 20px;
                      margin-top: 5px;
                      margin-bottom: 5px;
                      font-size: 28px;
                  }
                  .bgcount{
                    font-weight: bold;
                    font-size: 24px;
                    margin-left: 50px;
                  }
                  .info-table {
                      width: 100%;
                      border-collapse: collapse;
                  }
                  .info-table td {
                      border: 1px solid black;
                      padding: 5px;
                  }
                  .warehouse-info {
                      margin-top: 10px;
                      font-weight: bold;
                  }
                  .date-info {
                      margin-top: 10px;
                  }
                 .address1{
                      margin-felt: 100px;
                      font-size: 18px;
                  }
              </style>
          </head>
          <body>
              <div class="order-container">
                  <div class="header">TEMU物流单</div>
                  <div class="a1">
                      <span class="logMethod">${info.logisticsMethod || '||'}</span>
                        <span class="shop-info">店铺：${info.shopName || '未知店铺'}</span>
                  </div>
                

                  <div class="logNumber">${info.trackingNumber || ''}</div>
                  <table class="info-table">
                      <tr>
                          <td>货号</td>
                          <td>数量/双</td>
                      </tr>
                      ${productRows}
                  </table>
                   <div>共${totalQuantity}双 <span class="bgcount">共${info.bagCount || 1}袋</span></div>
                  <div class="warehouse-info">收货仓: ${info.warehouse || ''}</div>
                  <div class="date-info">${new Date().toLocaleString('zh-CN', { 
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      weekday: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                  })}</div>
                  <div class="address1">发货仓:晋江湖中地顶57号2楼</div>
              </div>
          </body>
          </html>`;
  }
  

  function extractOrderInfoFromText(text) {
    // TODO: 当前先保持原有页面文本解析规则不变；后续如果商家后台格式变化，再集中优化这里的正则。
    // 提取物流信息 - 修改正则表达式以适应新格式
    const logisticsMatch = text.match(/物流单号：\s*(.+?)，(.+?)(?:\s|$)/);
    
    // 提取仓库信息
    const warehouseMatch = text.match(/收货仓库：([^PC\n]+)/);
    
    // 提取所有货号和数量信息
    const productInfos = [];
    
    // 使用新的正则表达式来匹配货号和发货数量
    const sections = text.split('FH');
    for (const section of sections) {
        const productCodeMatch = section.match(/货号：(\d+)/);
        const quantityMatch = section.match(/发货数量：(\d+)件/);
        
        if (productCodeMatch && quantityMatch) {
            const productCode = productCodeMatch[1];
            const quantity = parseInt(quantityMatch[1]);
            
            // 检查是否已存在相同货号
            const existingProduct = productInfos.find(p => p.productCode === productCode);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                productInfos.push({
                    productCode,
                    quantity
                });
            }
        }
    }
    
    // 创建结果对象
    const result = {};
    
    if (logisticsMatch) {
        result.logisticsMethod = logisticsMatch[1];
        result.trackingNumber = logisticsMatch[2];
    }
    
    if (warehouseMatch) {
        result.warehouse = warehouseMatch[1].trim();
    }
    
    if (productInfos.length > 0) {
        result.products = productInfos;
    }
    
    console.log("提取的订单信息:", result);
    return Object.keys(result).length > 0 ? result : null;
}
