# 蜂宅首頁首屏

`index.html` 是官網首頁嵌入的頁面，網址為 `https://glenn6666.github.io/beehome-hero/`。保留原作品集與聯絡內容。

首屏沿用既有 `assets/smart-home-hero.mp4` 的日光至暖燈情境示意，靜音自動播放一次，結束後停留在暖燈畫面，可暫停、繼續與重播。這是燈光情境示意，不作為實際完工作品標示。

開啟減少動態效果或省流量設定時，預設顯示暖燈靜態圖；瀏覽器阻擋自動播放或影片載入失敗時也保留靜態畫面及手動播放控制。離開首屏或切到背景分頁會暫停；手動暫停後不會自行續播。

執行 `node tests/hero-playback.cjs` 檢查播放狀態與備援行為。

## 智能家居首屏

官網「智能家居」實際嵌入 `smart-home-v2.html`。此頁使用兩張 ImageGen 產生的同鏡位傍晚玻璃屋情境圖（`assets/smart-glass-house-off.jpg`、`assets/smart-glass-house-on.jpg`），素材為示意，並非蜂宅實際完工案例。圖片就緒後自動漸亮，亦可手動開／關燈；保留原有方案、生活情境切換及諮詢表單。

開啟減少動態效果時直接顯示亮燈畫面；使用者手動選擇後不再自行切換。手機版在首屏顯示期間收起底部固定諮詢列。`assets/smart-lighting.js` 負責狀態，執行 `node tests/smart-lighting.cjs` 驗證。

生活情境區使用同一室內鏡位的五張 ImageGen 示意影像，分別為低位夜燈、浴室局部照明、離家全關、回家暖光及電影院模式（客廳窗簾關閉、電視開啟）（`assets/smart-scene-*.jpg`）。`assets/smart-scenes.js` 同步影像、選取按鈕與說明；圖片未就緒時提供載入提示，快速切換不會被較慢的前次請求蓋回。執行 `node tests/smart-scenes.cjs` 驗證。

## Aqara 跌倒偵測介紹

`#care` 區塊介紹 FP2 的免穿戴、無攝影機與 App 通知，並列出天花板安裝、持續供電、模式互斥及輔助通知限制。官方產品頁及安裝說明書連結保留在頁面，便於查核。樣式位於 `assets/aqara-care.css`。
