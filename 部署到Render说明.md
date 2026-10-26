# 把「认识正比·实时互动课堂」发布成固定链接（任何电脑/平板都能打开）

## 这一步能解决什么
现在系统需要教师机本地开服务器。发布到云端后，会得到一个**固定网址**（如 `https://zhengbi-classroom.onrender.com`）：
- 教师端：任何电脑浏览器打开这个网址 → 进入教师端，屏幕显示课堂码 + 二维码
- 学生端：任何平板/手机扫这个二维码 → 自动进入，和教师端实时同步
- 不需要教师机一直开着，也不需要同一 WiFi

## 需要的账号（都免费）
1. GitHub 账号：https://github.com （注册一个即可）
2. Render 账号：https://render.com （用 GitHub 账号直接登录）

## 步骤一：把课堂文件上传到 GitHub（不用装 Git，网页操作）
1. 打开 https://github.com ，登录后点右上角 **＋ → New repository**
2. 仓库名填 `zhengbi-classroom`，其余默认，**Create repository**
3. 在空仓库页面点 **uploading an existing file**（或把文件拖进虚线框）
4. 把工作区里这 **5 个文件** 拖进去上传（不是整个文件夹，只传这 5 个）：
   - `认识正比-实时互动课堂.html`
   - `认识正比-课堂服务器.js`
   - `server.js`
   - `package.json`
   - `render.yaml`
5. 页面底部填提交说明（随便写，如 `课堂系统 v1.5`），点 **Commit changes**

## 步骤二：在 Render 一键部署（拿到固定链接）
1. 打开 https://render.com ，用 GitHub 登录
2. 点 **New → Web Service** ，授权连接刚才的 GitHub 仓库 `zhengbi-classroom`
3. 设置（大部分会自动填好）：
   - Name：`zhengbi-classroom`
   - Region：选 **Singapore**（离国内近）或 Oregon
   - Instance Type：**Free**（免费）
   - Build Command：`echo skip-build`
   - Start Command：`node server.js`
4. 点 **Create Web Service**，等 1–2 分钟部署完成
5. 部署好后，页面顶部会显示你的固定网址，形如：
   **`https://zhengbi-classroom.onrender.com`** ← 这就是固定链接，永久不变

## 步骤三：课堂使用
1. 教师端：用教室电脑/笔记本浏览器打开固定链接 → 进教师端（大屏显示课堂码 + 二维码）
2. 学生端：用平板/手机**相机或微信**扫该二维码 → 自动以学生身份进入
3. 学生完成「板块1·杆长与影长」探究 → 教师端实时看全班进度与手写笔迹

## 重要提醒（免费层的特性）
- **冷启动**：免费服务 15 分钟没人访问会自动休眠。**上课前 2–3 分钟先打开一次教师端链接**唤醒它，否则第一次打开会慢十几秒（不是坏了）。
- **课堂码隔离**：不同老师、不同节课用同一个链接，但**每节课点「换一组课堂码」生成不同 4 位码**即可互不干扰；把码告诉学生即可加入。
- 如果部署后访问提示「文件找不到」，多半是 GitHub 上传时漏了某个文件，回到步骤一补全 5 个文件重新提交即可。

## 不想用 GitHub/Render？备选
- **本地局域网**：教师机运行 `node 认识正比-课堂服务器.js`，同 WiFi 下平板扫码（仅限同一网络）。
- **内网穿透**：教师机运行服务器 + cpolar/ngrok，获得公网临时链接（免费版每次会变）。
- **自有服务器**：把工作区 5 个文件丢到学校/云 Linux 服务器，`node server.js` 并放行端口即可。
