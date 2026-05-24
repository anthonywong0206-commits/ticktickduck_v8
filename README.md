# Tick Tick Duck v8 Static - Group Activity 80% Stats Update

零 npm 靜態版，無需 npm install / build。

## 更新內容
- 首頁新增「是否小組活動」勾選。
- 活動統計只計算「活動簽到紀錄」內已確認保存的資料。
- 如活動勾選為小組活動，活動出席人數只計算出席率達 80% 或以上的參加者。
  - 例：12 名參加者中 1 名出席率不足 80%，統計人數只計 11 人。
- CSV/Excel 匯出同步顯示「是否小組活動」、「統計人數」及「計算方式」。

## 使用方法
1. 解壓 ZIP。
2. 將所有檔案覆蓋到 GitHub repo。
3. Commit changes。
4. Vercel / GitHub Pages 會自動更新。

## 部署設定
Vercel:
- Framework Preset: Other
- Install Command: 留空
- Build Command: 留空
- Output Directory: .

GitHub Pages:
- 直接將檔案放在 repo root。
