# 无法使用 GitHub 时怎么办

DAYS 是本地插件，**运行和安装都不依赖 GitHub**。GitHub 只负责“托管仓库、发 Release、收集 Issue”。
如果因为网络、账号、公司政策或认证问题发不上去，可以按下面任一路径继续。

## 先判断卡在哪一步

| 现象 | 大概率原因 | 处理 |
| --- | --- | --- |
| `git push` 一直超时 / 443 不通 | 网络限制 | 换 Gitee / 自建 / 只发 zip；或配置代理、SSH over 443 |
| `403 Permission denied` | 没有仓库权限或 Token 过期 | 重新生成 PAT；确认仓库归属 |
| `Authentication failed` | 本机没有凭证 | 用 PAT 或 SSH key，见下文 |
| `remote: Repository not found` | 远程地址拼错或私有仓库未授权 | `git remote -v` 检查；确认账号 |
| 能 push 但不想公开 | 隐私/合规 | 私有仓库、内网 Gitea，或只用离线包 |

当前本地仓库状态：**没有配置任何 remote**；`dist/` 下已生成离线发布物（见文末）。

## 方案 A：继续用 GitHub

```bash
# 1) 在 GitHub 新建空仓库 Days-Are-Yours（不要勾选 README）
# 2) 关联并推送
cd /path/to/days
git remote add origin https://github.com/<你的用户名>/Days-Are-Yours.git
git branch -M main
git push -u origin main
```

认证失败时二选一：

```bash
# HTTPS + PAT（GitHub → Settings → Developer settings → Personal access tokens）
git remote set-url origin https://<用户名>:<PAT>@github.com/<用户名>/Days-Are-Yours.git

# 或 SSH（443 端口，适合 22 被封的网络）
ssh-keygen -t ed25519 -C "days"
cat ~/.ssh/id_ed25519.pub   # 加到 GitHub → SSH keys
git remote set-url origin git@github.com:<用户名>/Days-Are-Yours.git
```

SSH 走 443：在 `~/.ssh/config` 加

```
Host github.com
  HostName ssh.github.com
  Port 443
  User git
```

## 方案 B：换一个 Git 托管（国内/海外）

| 平台 | 适合 | 地址 |
| --- | --- | --- |
| Gitee 码云 | 国内访问稳定 | https://gitee.com |
| GitLab | 私有仓库 / CI | https://gitlab.com |
| Codeberg | 非营利、无广告 | https://codeberg.org |
| 自建 Gitea/Forgejo | 内网、完全可控 | 见方案 C |

以 Gitee 为例（历史、标签、README 都会带过去）：

```bash
cd /path/to/days
git remote add gitee git@gitee.com:<用户名>/Days-Are-Yours.git
git branch -M main
git push -u gitee main
git push gitee --tags
```

GitLab / Codeberg 只需把 URL 换成对应平台的仓库地址，其余命令相同。
一个本地仓库可以同时保留多个 remote（`github` / `gitee` / `origin`），互不影响。

## 方案 C：自建 Gitea / Forgejo

适合公司内网或家里 NAS：

```bash
docker run -d --name gitea -p 3000:3000 -p 222:22 \
  -v gitea-data:/data -v /etc/timezone:/etc/timezone:ro \
  gitea/gitea:latest
```

浏览器打开 `http://localhost:3000` 建管理员与空仓库，然后：

```bash
git remote add gitea http://localhost:3000/<用户名>/Days-Are-Yours.git
git push -u gitea main
```

## 方案 D：完全不用 Git 托管（推荐先做这一步）

`scripts/package.sh` 会在 `dist/` 生成三个文件：

| 文件 | 用途 |
| --- | --- |
| `DAYS-1.5.3-source.zip` | 源码快照（不含 `.git`），发给别人解压即用 |
| `local-days-1.5.3.tgz` | `npm pack` 产物，解压出 `package/` 目录 |
| `DAYS-1.5.3-history.bundle` | 完整 Git 历史，可离线克隆/备份 |
| `SHA256SUMS` | 三个文件的校验和 |

安装（接收方）：

```bash
shasum -a 256 -c SHA256SUMS          # 先校验
unzip DAYS-1.5.3-source.zip -d Days-Are-Yours
# 或在 DSH 会话里让 agent 安装：
# plugin_manager install_bundle target=/绝对路径/Days-Are-Yours
```

用 tarball：

```bash
tar -xzf local-days-1.5.3.tgz        # 得到 package/
# plugin_manager install_bundle target=/绝对路径/package
```

用 bundle 恢复完整历史：

```bash
git clone DAYS-1.5.3-history.bundle Days-Are-Yours
cd Days-Are-Yours
git remote add origin <以后可用的仓库地址>
git push -u origin main
```

传输方式：网盘、U 盘、邮件附件、内网共享都行；文件不到 100 KB / 个。

## 方案 E：私有 npm / 内网 registry

如果有 Verdaccio 或公司 registry：

```bash
npm publish dist/local-days-1.5.3.tgz --registry https://npm.example.com
```

DAYS 的安装入口是**目录**（`plugin_manager install_bundle target=...`），因此更稳妥的方式仍是
`npm pack` → 解压 → 用解压后的目录安装；registry 适合团队内部留存版本，不要假设 Harness 支持直接按包名安装。

## 方案 F：只发布文档

如果只想让别人看到 README / 文档，而不托管代码：

- Cloudflare Pages / Netlify：把 `docs/` 或渲染后的静态页拖进去即可；
- 语雀 / Notion / 飞书文档：直接粘贴 README；
- 但注意：文档站不能替代代码仓库，安装仍需 zip 或仓库。

## 发布前的检查

```bash
node tests/check.mjs          # 149 条断言
node --check client.js index.js
./scripts/package.sh          # 重新生成 dist
shasum -a 256 -c dist/SHA256SUMS
```

- 不要把 `node_modules/`、`.DS_Store`、`.npm-cache/` 打进发布包（脚本已排除）。
- 不要把个人数据放进仓库；DAYS 的 `days/store` 数据只在浏览器里。
- 保留 `.git` 或 `dist/*.bundle`，换平台时历史不会丢。
- 打标签：`git tag v1.5.3 && git push <remote> v1.5.3`。

## 最短路径建议

1. 先跑 `./scripts/package.sh`，把 `dist/` 三个文件留一份（今天就能分发）。
2. 有空再补一个 Gitee/GitLab 私有仓库，`git push` 过去即可。
3. GitHub 恢复后，加一个 `github` remote 再推一次，不需要重建仓库。
