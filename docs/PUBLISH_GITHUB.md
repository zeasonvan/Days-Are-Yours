# 打包并发布到 GitHub

本地仓库已经初始化、提交历史完整，**只差一个 GitHub 远程仓库和一次 push**。
下面按“先代码、再 Release、最后验证”的顺序执行。

## 0. 发布前自检（每次发版都做）

```bash
cd /path/to/days
node --check client.js index.js
node tests/check.mjs            # 应为 149 条全过
node -p "require('./package.json').version"   # 当前 1.5.3
git status                      # 应为 clean
```

生成发布物（不联网、不发布）：

```bash
./scripts/package.sh
ls dist/
```

会得到：

| 文件 | 用途 |
| --- | --- |
| `local-days-1.5.3.tgz` | `npm pack` 包，解压后是 `package/` 目录 |
| `DAYS-1.5.3-source.zip` | 源码快照（不含 `.git`） |
| `DAYS-1.5.3-history.bundle` | 完整 Git 历史，可离线 clone |
| `SHA256SUMS` | 校验和 |

> `dist/` 已被 `.gitignore` 忽略，不会进入仓库；它只作为 Release 附件或离线分发。

## 1. 在 GitHub 建仓库

浏览器打开 <https://github.com/new>：

- Repository name：`Days-Are-Yours`
- 可见性：Public（要私有也可以，安装方式不变）
- **不要**勾选 “Add a README / .gitignore / license”，本地已经有了
- Create repository

## 2. 关联并推送代码

把 `<你的用户名>` 换成实际账号：

```bash
cd /path/to/days
git remote add origin https://github.com/<你的用户名>/Days-Are-Yours.git
git branch -M main
git push -u origin main
```

认证方式二选一：

```bash
# A. HTTPS + Personal Access Token（GitHub → Settings → Developer settings → Tokens）
#    弹出密码时粘贴 PAT，而不是账号密码

# B. SSH（22 被封时用 443，见 docs/DISTRIBUTION.md）
ssh-keygen -t ed25519 -C "days"
cat ~/.ssh/id_ed25519.pub        # 加到 GitHub → SSH and GPG keys
git remote set-url origin git@github.com:<你的用户名>/Days-Are-Yours.git
git push -u origin main
```

push 成功后：

- 仓库首页应显示 README、banner、MIT License；
- **Actions** 标签页会自动跑 `.github/workflows/ci.yml`（语法检查 + 149 条测试 + manifest 校验），应显示绿色。

## 3. 打标签

```bash
git tag -a v1.5.3 -m "DAYS v1.5.3"
git push origin v1.5.3
```

标签用于 Release 与“用户装的是哪一版”的对照；以后每次发版递增（v1.5.3、v1.6.0…）。

## 4. 创建 GitHub Release

### 方式 A：网页（推荐，当前机器没装 `gh`）

1. 仓库页右侧 **Releases → Draft a new release**
2. Choose a tag：`v1.5.3`（第 3 步已推送）
3. Release title：`DAYS v1.5.3 — Make Every Day Count.`
4. 描述直接粘贴 `CHANGELOG.md` 里 1.5.3 段落（以及安装说明三行）
5. **Attach binaries**：把 `dist/` 下四个文件拖进去
   - `local-days-1.5.3.tgz`
   - `DAYS-1.5.3-source.zip`
   - `DAYS-1.5.3-history.bundle`
   - `SHA256SUMS`
6. 勾选 “Set as the latest release” → **Publish release**

### 方式 B：命令行（先安装 `gh`）

```bash
brew install gh
gh auth login
gh release create v1.5.3 dist/* \
  --title "DAYS v1.5.3 — Make Every Day Count." \
  --notes-file CHANGELOG.md
```

（`gh` 未安装时不要执行；不影响网页方式。）

> GitHub 会自动附带 “Source code (zip/tar.gz)”，那是仓库快照；
> 我们额外上传 tgz/bundle/校验和，是为了可复现与离线安装。

## 5. 别人怎么安装

从 GitHub 安装（克隆或下载 ZIP 都行）：

```bash
git clone https://github.com/<用户名>/Days-Are-Yours.git
# 在 DSH 会话里让 agent 执行：
# plugin_manager install_bundle target=/绝对路径/Days-Are-Yours
```

或下载 Release 里的 `DAYS-1.5.3-source.zip`，解压后把解压目录作为 target。

安装后刷新 Harness（⌘R），侧边栏出现 DAYS 图标。
本地数据 key 仍是 `lifeos/store`，升级不丢数据。

## 6. 以后每次发版

```bash
# 1) 改代码 / 文档
# 2) 更新 package.json 的 version 与 CHANGELOG.md
node tests/check.mjs
./scripts/package.sh
# 3) 提交并推送
git add -A
git commit -m "feat: ..."
git push
# 4) 打标签并推送
git tag -a vX.Y.Z -m "DAYS vX.Y.Z"
git push origin vX.Y.Z
# 5) 新建 Release 并上传新的 dist 文件
```

## 7. 常见问题

| 问题 | 处理 |
| --- | --- |
| `remote origin already exists` | `git remote set-url origin <url>` |
| `src refspec main does not match any` | 当前分支不是 main：`git branch -M main` |
| `403` / `Authentication failed` | PAT 过期或没有 repo 权限；重新生成并更新凭证 |
| push 超时（443/22） | 用 SSH over 443；或先发 Release 到 Gitee/GitLab（见 DISTRIBUTION.md） |
| Actions 红了 | 本地先跑 `node tests/check.mjs`；看日志里 `node --check` 或断言失败 |
| 仓库里多了 `dist/` | 确认 `.gitignore` 含 `dist/`，`git rm -r --cached dist` |

## 8. 安全与体积

- 仓库里没有密钥、Token、个人数据；`lifeos/store` 只存在浏览器。
- 不要提交 `node_modules/`、`.npm-cache/`、`.DS_Store`（`.gitignore` 已覆盖）。
- 当前仓库约 1.6 MB，远低于 GitHub 限制，不需要 Git LFS。
