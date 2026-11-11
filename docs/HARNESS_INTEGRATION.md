# Harness integration

## Bundle

```json
{
  "name": "@local/lifeos",
  "type": "module",
  "exports": { ".": "./index.js", "./client": "./client.js", "./locale/*.json": "./locale/*.json", "./icon": "./icon.svg" },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { "platform": "web", "immediately": true, "inject": ["@deepseek-ai/dsh-client-ui-sidebar"] }
  }
}
```

`cordis.patch.yml` 只插入一行 `@local/lifeos`。

## 客户端注册

```js
ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
  name: 'sidebar.panellist', id: 'lifeos', order: 40, label: () => 'LifeOS',
}, PanelGlyph))

ctx.slots.inject('main', () => ctx.slots.register({
  name: 'main', key: 'lifeos',
}, Page))
```

## 宿主契约

- `ctx.slots.inject(key, callback)` 的 callback 必须返回注册 disposer。
- `label` 可以是函数，用于语言切换。
- `main` 是 keyed slot，侧边栏 id 与 key 同名即可导航。
- 组件不得替换根节点、不得操作 `document.body`、不得读取其他插件 DOM。

## 兼容性与回退

- 只依赖 Slot 形状与主题 token；token 改名只影响外观。
- 旧 `@local/countdown` 可随时重新启用；两者 key 不同（`countdown` / `lifeos`），互不覆盖数据。
- 若未来 Harness 调整 slot 名称，LifeOS 需同步修改注册段，业务逻辑不受影响。

## 已知限制

- 无法在构建环境截图验证（页面需鉴权、无 CDP）。
- Host Tools 契约未核验，v1.0 不注册 Tool。
