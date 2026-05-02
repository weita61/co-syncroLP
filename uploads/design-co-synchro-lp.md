---
title: CO-SYNCHRO Landing Page — Design & Implementation Specification
version: 1.0
date_created: 2026-05-03
owner: 渡辺瑛太 / CO-SYNCHRO
tags: [design, lp, frontend, 3d, animation]
---

# Introduction

CO-SYNCHROのランディングページ（LP）の設計・実装仕様書。
BtoB向けに「スキャンで化学反応を演出するコミュニケーションOS」の価値を伝える単一ページ。
洗練されたビジュアル・CSS作り込み・WebGL/Three.js 3Dを使った没入感のある体験を目指す。

---

## 1. Purpose & Scope

### 目的

- CO-SYNCHROの価値を「見た目で」伝える。読む前に「すごい」と思わせる。
- BtoB向け（空港・HR担当者・成田空港担当者）への第一印象を作る。
- 将来的なプレスリリース・投資家向けリンクとして機能する。

### スコープ

- 単一ページLP（index.html）
- 日本語版のみ（v1。EN版はv2以降）
- デプロイ先：Vercel
- 技術スタック：HTML + CSS + Vanilla JS + Three.js（SSG不要）

### 対象読者（仕様書）

- 実装担当：Claude Code
- レビュー・承認：渡辺瑛太（CEO）

---

## 2. Definitions

| 用語 | 定義 |
|---|---|
| LP | ランディングページ。単一ページのウェブサイト。 |
| スキャン | スマートフォンを近づけて2人が繋がる CO-SYNCHRO 固有のインタラクション |
| スキャン体験 | スキャンからAIによる化学反応演出・相性スコア表示までの一連のフロー |
| PersonalityVector | スキャン時に交換するユーザーの特性ベクトル（個人情報は含まない） |
| シンクログラフ | チーム全体のスキャン繋がりをグラフ化したもの（ダッシュボードで可視化） |
| Three.js | WebGL を抽象化した JavaScript 3Dライブラリ |
| GSAP | GreenSock Animation Platform。高品質なスクロールアニメーション用ライブラリ |
| BtoB | Business to Business。空港・企業が顧客。個人ユーザーは直接の課金対象でない。 |

---

## 3. Requirements, Constraints & Guidelines

### デザイントークン（`00_管理/design_principles.md` から継承）

```css
:root {
  --color-bg:       #F5F7FF;
  --color-text:     #0D1117;
  --color-muted:    #6E7B8C;
  --color-accent:   #0057FF;
  --color-accent2:  #00D4B5;
  --color-surface:  #FFFFFF;
  --color-border:   #E2E6EF;
  --color-dark-bg:  #0D1117;   /* ダークセクション背景 */

  --font-heading:   'Inter', 'Zen Maru Gothic', sans-serif;
  --font-body:      'Noto Sans JP', 'Inter', sans-serif;
  --font-mono:      'JetBrains Mono', monospace;

  --radius-sm:      8px;
  --radius-md:      16px;
  --radius-lg:      32px;
  --max-width:      1080px;
  --section-gap:    120px;
}
```

### 必須要件

- **REQ-001**: ページ構成はセクション7つ（Hero / Problem / Solution / HowItWorks / Testimonial / Pricing / CTA）
- **REQ-002**: Hero セクションは Three.js による 3D パーティクル背景を持つ
- **REQ-003**: スクロール連動アニメーション（GSAP ScrollTrigger または CSS scroll-driven animations）
- **REQ-004**: スキャン体験のモックアニメーション（スマートフォン2台がくっつくシーン）を実装
- **REQ-005**: Sticky ヘッダー（backdrop-filter: blur）
- **REQ-006**: レスポンシブ対応（768px breakpoint）
- **REQ-007**: Vercelへのデプロイ設定（vercel.json）
- **REQ-008**: ページ全体のLCPが2.5秒以下（Lighthouse 90+）
- **REQ-009**: 絵文字の使用禁止（アイコンはSVGのみ）

### 制約

- **CON-001**: ピュアHTML + CSS + Vanilla JS（Reactなど不使用）
- **CON-002**: Three.jsはCDNから読み込む（`<script type="importmap">`）
- **CON-003**: コンテンツはJSオブジェクト（`data.js`）に集約。HTMLに直書きしない
- **CON-004**: 画像は使わない（SVG・CSS・WebGLのみで表現）
- **CON-005**: フォントはGoogle Fonts CDNから読み込む

### ガイドライン

- **GUD-001**: ダークセクション（`#0D1117` 背景）とライトセクション（`#F5F7FF` 背景）を交互に配置
- **GUD-002**: CTA ボタンは `translateY(-2px) + box-shadow` のホバー演出を必ず付ける
- **GUD-003**: セクション見出しには `section-label`（大文字・12px・accent色）を必ず付ける
- **GUD-004**: 3Dアニメーションはperformance考慮。`requestAnimationFrame` 最適化・モバイルでは簡易版にフォールバック

---

## 4. ページ構成 & セクション詳細

### 4.1 全体構造

```
index.html
├── <head>        フォント・CDN・meta
├── <header>      sticky ナビゲーション
├── <main>
│   ├── #hero          Hero（3D背景 + キャッチコピー）
│   ├── #problem       Problem（課題提起）
│   ├── #solution      Solution（CO-SYNCHROとは）
│   ├── #how-it-works  HowItWorks（スキャン体験デモ）
│   ├── #use-cases     UseCases（ユースケース）
│   ├── #testimonial   Testimonial / Data（数字で語る）
│   └── #cta           CTA（問い合わせ）
└── <footer>
```

### 4.2 Hero セクション

**背景:** Three.js によるインタラクティブ3Dパーティクル
- 粒子が「2つのクラスターが引き合って融合する」動きを表現（スキャン体験の比喩）
- パーティクルカラー：`#0057FF`（ブルー群）と `#00D4B5`（ティール群）
- マウス移動に反応してパーティクルが揺れる

**コピー（中央配置）:**
```
CO-SYNCHRO

1秒で、化学反応。
スマートフォンを突き合わせるだけで、
AIが二人の繋がりを演出する。

[ 詳しく見る ]  [ 資料請求 ]
```

**アニメーション順序:** コピーが上から fade-in → CTAボタン出現 → 3Dパーティクル起動

### 4.3 Problem セクション（ライト背景）

**コピー:**
```
PROBLEM

成田空港では、今何が起きているか。

[3カード：横並び]
Card 1: 言語の壁
        同じ職場に7言語。挨拶すら届かない。

Card 2: 孤立と離職
        外国人スタッフの3年以内離職率は約60%。
        原因の第1位は「職場の孤立感」。

Card 3: コミュニケーションコスト
        通訳・翻訳研修の年間コストは
        空港1施設で数千万円。
```

**カードデザイン:** 数字が大きく、hover で `translateY(-8px)` + 影が浮く

### 4.4 Solution セクション（ダーク背景）

**コピー:**
```
SOLUTION

言語より先に、共鳴する。

CO-SYNCHROは「翻訳」ではなく「接触設計」をする。
スマートフォンを近づける1秒で、
AIが二人の化学反応を可視化する。
```

**ビジュアル:** CSS + SVGによるスマートフォン2台のアニメーション
- 2台が近づく → 画面にパルスリング（`#00D4B5`）が広がる → 接続完了のハプティクス表現（画面揺れ）

### 4.5 HowItWorks セクション（ライト背景）

**コピー:**
```
HOW IT WORKS

3ステップで、繋がる。
```

**ステップカード（縦積み or 横並び）:**

```
Step 1: スキャン
        スマホを近づけて1秒。
        設定不要。アプリを開くだけ。
        [スマートフォン近接アニメーション]

Step 2: 化学反応
        AIが相手の特性カードを3枚生成。
        相性スコアがリアルタイムで出る。
        [カード降ってくるアニメーション]

Step 3: 会話が始まる
        AIが「最初の一言」を提案。
        言語は自動切り替え。
        [チャットバブルが現れるアニメーション]
```

**実装:** スクロール位置に合わせて各ステップが順番にフェードイン（GSAP ScrollTrigger）

### 4.6 UseCases セクション（ダーク背景）

**コピー:**
```
USE CASES

使われる場所は、現場だ。
```

**カードグリッド（3列）:**
| アイコン | タイトル | 説明 |
|---|---|---|
| SVG: 飛行機 | 空港・港湾 | 成田空港10万人スタッフの多国籍チーム構築 |
| SVG: 建物 | 大規模製造業 | ライン作業者の言語混在チームのオンボーディング |
| SVG: ハンドシェイク | 企業研修 | 異文化チームビルディング研修への組み込み |

### 4.7 Testimonial / Data セクション（ライト背景）

**コピー:**
```
DATA

数字で語る。
```

**メトリクス（大きな数字）:**
- `10万人` — 成田空港拡大後のスタッフ数
- `60%` — 外国人スタッフの3年以内離職率
- `1秒` — スキャンにかかる時間
- `7言語` — CO-SYNCHROのUI対応言語数

**実装:** カウントアップアニメーション（ScrollTrigger で数字がカウントアップ）

### 4.8 CTA セクション（ダーク背景・グラデーション）

**背景:** `linear-gradient(135deg, #0057FF 0%, #00D4B5 100%)` のグラデーション

**コピー:**
```
成田空港の現場で、試してみませんか。

最初はグローバルアイでの小規模PoCから。
導入コスト・リスクをゼロに近づけた
トライアルプランを用意しています。

[ お問い合わせ・資料請求 ]
```

### 4.9 Header / Footer

**ヘッダー:**
```
CO-SYNCHRO  [ロゴ（テキスト + SVGアイコン）]    問題 ソリューション 使い方 お問い合わせ    [資料請求ボタン]
```

**フッター:**
```
© 2026 CO-SYNCHRO / NPO法人グローバルアイ
運営：渡辺瑛太
```

---

## 5. 3D & Animation 仕様

### 5.1 Hero パーティクル（Three.js）

```javascript
// パーティクル設定
const PARTICLE_COUNT = 400;           // 総数
const CLUSTER_A_COLOR = 0x0057FF;     // ブルー群（150粒子）
const CLUSTER_B_COLOR = 0x00D4B5;     // ティール群（150粒子）
const NEUTRAL_COLOR   = 0xE2E6EF;     // ニュートラル（100粒子）

// アニメーション：2クラスターが引き合う動き
// Phase 1（0〜3s）: 離れた状態でゆらゆら
// Phase 2（3〜6s）: ゆっくり近づく
// Phase 3（6〜8s）: 融合・散乱・再配置
// → ループ

// マウス反応：カーソル位置に向かって近くの粒子が流れる
// モバイルフォールバック：Three.js無効化、CSS gradientアニメーションに切り替え
```

### 5.2 スキャン体験アニメーション（CSS + SVG）

```css
/* スマートフォン2台のコンテナ */
.scan-demo {
  display: flex;
  gap: 80px;
  align-items: center;
  justify-content: center;
}

/* スクロール位置で gap が 0 に縮まる → 接触 → パルス発生 */
/* GSAP ScrollTrigger で gap を 80px → 0 に tween */

/* パルスリング */
.pulse-ring {
  border-radius: 50%;
  border: 2px solid var(--color-accent2);
  animation: pulse 1.5s ease-out infinite;
}
@keyframes pulse {
  0%   { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
}
```

### 5.3 数字カウントアップ

```javascript
// ScrollTrigger でビューポート内に入ったとき発火
// duration: 2000ms、easingはeaseOutQuart
// 例: 0 → 100000（10万人）
```

### 5.4 カードホバーエフェクト（CSS 3D transform）

```css
.card {
  transform-style: preserve-3d;
  perspective: 1000px;
  transition: transform 300ms ease, box-shadow 300ms ease;
}
.card:hover {
  transform: translateY(-8px) rotateX(2deg) rotateY(-2deg);
  box-shadow: 0 20px 60px rgba(0, 87, 255, 0.15);
}
```

---

## 6. ファイル構成

```
10_LP/
├── spec/
│   └── design-co-synchro-lp.md     ← このファイル
├── index.html
├── style.css
├── data.js                          ← 全コンテンツ（コピー・数字・ラベル）
├── main.js                          ← スクロールアニメーション・インタラクション
├── three-scene.js                   ← Three.js パーティクルシーン
└── vercel.json
```

---

## 7. Acceptance Criteria

- **AC-001**: Hero に Three.js パーティクルが表示され、マウスに反応して動く
- **AC-002**: スクロールでスキャン体験アニメーションが順番に再生される
- **AC-003**: メトリクス数字がビューポート内に入ったときカウントアップする
- **AC-004**: Lighthouse Performance スコアが 90 以上
- **AC-005**: 768px 以下のモバイルで Three.js が無効化され、代替背景が表示される
- **AC-006**: 全 CTA ボタンが `translateY(-2px)` ホバーエフェクトを持つ
- **AC-007**: 絵文字が一切含まれていない
- **AC-008**: Vercel にデプロイされ、HTTPS で閲覧できる

---

## 8. Dependencies & External Integrations

### CDN

- **EXT-001**: Three.js r160 — `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js`
- **EXT-002**: GSAP 3.x + ScrollTrigger — `https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js`
- **EXT-003**: Google Fonts — Inter, Noto Sans JP, Zen Maru Gothic, JetBrains Mono

### デプロイ

- **INF-001**: Vercel（Free Tier）— `vercel.json` で静的ファイルサーブ

---

## 9. コンテンツ（data.js）

```javascript
export const CONTENT = {
  hero: {
    label:    "CO-SYNCHRO",
    heading:  "1秒で、化学反応。",
    subheading: "スマートフォンを突き合わせるだけで、\nAIが二人の繋がりを演出する。",
    cta_primary:   "詳しく見る",
    cta_secondary: "資料請求",
  },
  problem: {
    label:   "PROBLEM",
    heading: "成田空港では、今何が起きているか。",
    cards: [
      { icon: "language", title: "言語の壁",          body: "同じ職場に7言語。挨拶すら届かない。" },
      { icon: "person",   title: "孤立と離職",        body: "外国人スタッフの3年以内離職率は約60%。原因の第1位は「職場の孤立感」。" },
      { icon: "yen",      title: "コミュニケーションコスト", body: "通訳・翻訳研修の年間コストは空港1施設で数千万円規模。" },
    ],
  },
  solution: {
    label:   "SOLUTION",
    heading: "言語より先に、共鳴する。",
    body:    "CO-SYNCHROは「翻訳」ではなく「接触設計」をする。\nスマートフォンを近づける1秒で、AIが二人の化学反応を可視化する。",
  },
  howItWorks: {
    label:   "HOW IT WORKS",
    heading: "3ステップで、繋がる。",
    steps: [
      { number: "01", title: "スキャン",     body: "スマホを近づけて1秒。設定不要。アプリを開くだけ。" },
      { number: "02", title: "化学反応",     body: "AIが相手の特性カードを3枚生成。相性スコアがリアルタイムで出る。" },
      { number: "03", title: "会話が始まる", body: "AIが「最初の一言」を提案。言語は自動切り替え。" },
    ],
  },
  useCases: {
    label:   "USE CASES",
    heading: "使われる場所は、現場だ。",
    cards: [
      { title: "空港・港湾",   body: "成田空港10万人スタッフの多国籍チーム構築" },
      { title: "大規模製造業", body: "ライン作業者の言語混在チームのオンボーディング" },
      { title: "企業研修",    body: "異文化チームビルディング研修への組み込み" },
    ],
  },
  metrics: {
    label:   "DATA",
    heading: "数字で語る。",
    items: [
      { value: 100000, suffix: "人", label: "成田空港拡大後のスタッフ数" },
      { value: 60,     suffix: "%",  label: "外国人スタッフの3年以内離職率" },
      { value: 1,      suffix: "秒", label: "スキャンにかかる時間" },
      { value: 7,      suffix: "言語", label: "CO-SYNCHROのUI対応言語数" },
    ],
  },
  cta: {
    label:   "CONTACT",
    heading: "成田空港の現場で、試してみませんか。",
    body:    "最初はグローバルアイでの小規模PoCから。\n導入コスト・リスクをゼロに近づけたトライアルプランを用意しています。",
    cta:     "お問い合わせ・資料請求",
  },
};
```

---

## 10. Validation Criteria

| # | 確認項目 | 確認方法 |
|---|---|---|
| 1 | Three.js パーティクルが Chrome・Safari・Firefox で動作する | 手動確認 |
| 2 | モバイル（375px）でレイアウト崩れなし | DevTools モバイルエミュレーション |
| 3 | Lighthouse Performance 90+ | Chrome Lighthouse |
| 4 | Three.jsがモバイルで無効化 → フォールバック背景表示 | DevTools モバイルエミュレーション |
| 5 | Vercel デプロイ後に HTTPS アクセスできる | ブラウザ確認 |
| 6 | 全テキストが `data.js` に集約され、HTML内に直書きがない | コードレビュー |

---

## 11. 関連ドキュメント

- [デザイン原則](../00_管理/design_principles.md)
- [プロジェクト概要](../00_管理/project_overview.md)
- [スキャン体験フロー](../06_ソリューション設計/UXフロー/scan_ceremony_flow.md)
- [ビジネスモデル](../03_戦略/business_model.md)
