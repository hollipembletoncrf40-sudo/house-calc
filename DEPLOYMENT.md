# GitHub Pages 部署指南

## 当前状态
✅ Git 仓库已初始化
✅ 所有文件已提交到本地仓库
✅ 主分支已设置为 `main`

## 下一步操作

### 1. 创建 GitHub 仓库

请按照以下步骤在 GitHub 上创建仓库：

1. **访问 GitHub**
   - 打开浏览器，访问 [https://github.com](https://github.com)
   - 登录您的 GitHub 账号

2. **创建新仓库**
   - 点击右上角的 `+` 按钮
   - 选择 `New repository`

3. **配置仓库信息**
   - **Repository name**: `real-estate-calculator` （或您喜欢的名称）
   - **Description**: `专业的买房投资决策计算器 - 计算收益、评估风险、提供决策建议`
   - **Public/Private**: 选择 `Public`（GitHub Pages 免费版需要公开仓库）
   - **不要勾选** "Add a README file"（我们已经有了）
   - **不要勾选** "Add .gitignore"（我们已经创建了）
   - 点击 `Create repository`

### 2. 连接并推送到 GitHub

创建仓库后，GitHub 会显示一个页面，请复制仓库的 URL（格式类似：`https://github.com/您的用户名/real-estate-calculator.git`）

然后在终端运行以下命令（请替换 URL 为您的实际仓库地址）：

```bash
cd "/Users/josephine001/Desktop/房租收益计算"
git remote add origin https://github.com/您的用户名/real-estate-calculator.git
git push -u origin main
```

### 3. 配置 GitHub Pages

推送成功后：

1. 在 GitHub 仓库页面，点击 `Settings`（设置）
2. 在左侧菜单中找到 `Pages`
3. 在 "Source" 部分：
   - **Branch**: 选择 `main`
   - **Folder**: 选择 `/ (root)`
4. 点击 `Save`

### 4. 等待部署完成

- GitHub 会自动开始部署
- 通常需要 1-3 分钟
- 部署完成后，页面上会显示您的网站地址：
  ```
  https://您的用户名.github.io/real-estate-calculator/
  ```

### 5. 访问您的在线计算器

部署完成后，您就可以通过上面的 URL 访问您的买房投资决策计算器了！

## 后续更新

如果您需要更新网站内容，只需：

```bash
cd "/Users/josephine001/Desktop/房租收益计算"
git add .
git commit -m "更新说明"
git push
```

GitHub Pages 会自动重新部署最新版本。

## 注意事项

- ✅ 所有文件都是静态的（HTML/CSS/JS），完美适合 GitHub Pages
- ✅ 无需服务器，完全免费托管
- ✅ 支持自定义域名（如果需要）
- ⚠️ 仓库必须是 Public（公开）才能使用免费的 GitHub Pages

## 需要帮助？

如果您在创建 GitHub 仓库或推送代码时遇到问题，请告诉我具体的错误信息，我会帮您解决！
