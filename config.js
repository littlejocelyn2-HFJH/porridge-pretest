/* 設定檔：把 Apps Script 部署後的 /exec 網址貼在 sheetApi 的引號裡。
 * 留空 = 本機模式（資料只存在這台裝置的瀏覽器，適合試用）。
 * 改完請把 index.html 裡 config.js?v= 的數字加 1，避免學生手機抓到舊檔。
 */
window.MZ_CONFIG = {
  sheetApi: "",
  // 疑似亂答：用時少於幾秒（本前測約 8～10 分鐘，預設 90 秒；老師在成績頁也可以臨時調整）
  suspectSeconds: 90,
  // 診斷分析預設使用每位學生的「第一次」作答（最能反映起點）
  analyzeAttempt: "first"
};
