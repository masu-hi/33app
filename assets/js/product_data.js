window.PRODUCTS = {
  penlight: {
    id: "penlight",
    category: "penlight",
    name: "ペンライト",
    price: 800,
    rentalDays: 4,
    extensionFee: 440,
    shippingFee: 440,
    images: ["assets/images/penlight.png"],
    description:
      "シンプルで使いやすい定番のペンライトです。どんな場面でも使いやすい汎用タイプなので、初めての方にもおすすめです。",
    options: [
      {
        name: "カラー",
        values: ["ピンク", "ブルー", "パープル", "ホワイト"],
      },
    ],
  },
  bag: {
    id: "bag",
    category: "bag",
    name: "推し活バッグ",
    price: 2400,
    rentalDays: 3,
    extensionFee: 440,
    shippingFee: 440,
    images: ["assets/images/bag_hero.png"],
    description:
      "推し活にぴったりな、可愛らしく使いやすいバッグです。収納力があり、ライブやイベントに必要なものをまとめて持ち運べます。推しカラーで楽しめるバッグです。",
    options: [
      {
        name: "バッグの種類",
        values: ["2WAYバッグ", "ショルダーバッグ", "トートバッグ"],
      },
      {
        name: "カラー",
        values: ["赤", "ピンク", "オレンジ", "黄色", "白", "青", "水色", "紫", "緑", "黒"],
      },
    ],
  },
  binoculars: {
    id: "binoculars",
    category: "binoculars",
    name: "双眼鏡",
    price: 2400,
    rentalDays: 3,
    extensionFee: 440,
    shippingFee: 440,
    images: ["assets/images/binoculars_hero.png"],
    description:
      "ライブやコンサートで遠くの推しをしっかり見られる双眼鏡です。コンパクトで持ち運びやすく、ステージ上の表情やパフォーマンスも楽しめます。",
    options: [
      {
        name: "倍率",
        values: ["8倍", "10倍", "12倍", "14倍", "16倍"],
      },
      {
        name: "機能",
        values: ["防振", "防水"],
      },
    ],
  },
  fan: {
    id: "fan",
    category: "fan",
    name: "ファンサうちわ",
    price: 2400,
    rentalDays: 3,
    extensionFee: 440,
    shippingFee: 440,
    images: ["assets/images/fan_hero.png"],
    description:
      "ライブでのファンサにぴったりなうちわです。大きく見やすい文字と、ステージからも見つけてもらいやすいデザインです。",
    options: [
      {
        name: "メッセージ",
        values: ["ピースして", "指ハートして", "見つけて"],
      },
      {
        name: "カラー",
        values: ["ピンク", "パープル", "ブルー"],
      },
    ],
  },
  set: {
    id: "set",
    category: "set",
    name: "撮影セット",
    price: 3200,
    rentalDays: 3,
    extensionFee: 440,
    shippingFee: 440,
    images: ["assets/images/penillust.png"],
    description: "ライブやイベントでの思い出を残すために必要なアイテムをまとめた撮影セットです。",
    options: [
      {
        name: "セット内容",
        values: ["スマホ三脚", "リングライト", "スマホ用レンズ", "充電ケーブル"],
      },
    ],
  },
};
