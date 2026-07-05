# Tick Tick Duck v8 Static - Attendance Click Fix

零 npm 靜態版，毋須 npm install / build。

## 更新內容
- 新增 Supabase 雲端同步，內容會保存到 Supabase `ticktickduck_content` 資料表
- 保留 localStorage 作離線/失敗時備份；雲端連線失敗時網站仍可照常使用
- 修復出席頁面不能勾選的問題
- 保持點擊循環：一下綠圈 ○、兩下紅 X、三下取消
- 勾選後不重刷頁面，保留表格橫向/縱向位置
- 保持底部導航及現有版面設定

## 使用方法
1. 解壓 ZIP
2. 將全部檔案覆蓋到 GitHub repo root
3. Commit changes
4. Vercel / GitHub Pages 會自動更新
