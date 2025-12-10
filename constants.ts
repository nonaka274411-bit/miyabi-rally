import { Checkpoint, Prize } from './types';

export const CHECKPOINTS: Checkpoint[] = [
  { 
    id: 1, 
    name: "美容室オークラ 野中店", 
    description: "40年の感謝を込めて。あなたの美しさを引き出す、くつろぎの空間。", 
    address: "静岡県富士宮市野中1111-1", 
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80", 
    lat: 35.215, 
    lng: 138.615,
    phone: "0544-26-1111",
    hours: "9:00 - 18:00 (月曜定休)"
  },
  { 
    id: 2, 
    name: "美容室オークラ 粟倉店", 
    description: "確かな技術と温かいおもてなし。地域の皆様に愛されるサロン。", 
    address: "静岡県富士宮市粟倉2222-2", 
    image: "https://images.unsplash.com/photo-1521590832896-13593295a085?auto=format&fit=crop&w=800&q=80", 
    lat: 35.235, 
    lng: 138.635,
    phone: "0544-26-2222",
    hours: "9:00 - 18:00 (月曜定休)"
  },
  { 
    id: 3, 
    name: "富士山本宮浅間大社", 
    description: "全国にある浅間神社の総本宮。富士山信仰の中心地。", 
    address: "静岡県富士宮市宮町1-1", 
    image: "https://images.unsplash.com/photo-1589218436045-ee320057f443?auto=format&fit=crop&w=800&q=80", 
    lat: 35.226, 
    lng: 138.610,
    phone: "0544-27-2002",
    hours: "6:00 - 19:00 (参拝自由)"
  },
  { 
    id: 4, 
    name: "静岡県富士山世界遺産センター", 
    description: "逆さ富士のフォルムが特徴的な、富士山の歴史と文化を学ぶ拠点。", 
    address: "静岡県富士宮市宮町5-12", 
    image: "https://images.unsplash.com/photo-1565619568-16474f8376e1?auto=format&fit=crop&w=800&q=80", 
    lat: 35.223, 
    lng: 138.612,
    phone: "0544-21-3776",
    hours: "9:00 - 17:00 (休館日あり)"
  },
  { 
    id: 5, 
    name: "白糸の滝", 
    description: "幅150mの湾曲した絶壁から絹糸のように水が流れ落ちる名勝。", 
    address: "静岡県富士宮市上井出", 
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80", 
    lat: 35.312, 
    lng: 138.588,
    phone: "0544-27-5240",
    hours: "24時間散策可能"
  },
  { 
    id: 6, 
    name: "田貫湖", 
    description: "ダイヤモンド富士の撮影スポットとしても有名な、静謐な湖。", 
    address: "静岡県富士宮市猪之頭", 
    image: "https://images.unsplash.com/photo-1576675784201-1e711b2b5243?auto=format&fit=crop&w=800&q=80", 
    lat: 35.344, 
    lng: 138.558,
    phone: "0544-27-5240",
    hours: "24時間散策可能"
  },
  { 
    id: 7, 
    name: "湧玉池", 
    description: "富士山の雪解け水が湧き出る、浅間大社の神聖な池。", 
    address: "静岡県富士宮市宮町", 
    image: "https://images.unsplash.com/photo-1596547608249-16634c0d2eb0?auto=format&fit=crop&w=800&q=80", 
    lat: 35.226, 
    lng: 138.611,
    phone: "0544-27-2002",
    hours: "参拝自由"
  },
  { 
    id: 8, 
    name: "お宮横丁", 
    description: "富士宮やきそば学会アンテナショップなど、B級グルメが集う場所。", 
    address: "静岡県富士宮市宮町4-23", 
    image: "https://images.unsplash.com/photo-1555554317-a071e5426eb9?auto=format&fit=crop&w=800&q=80", 
    lat: 35.225, 
    lng: 138.611,
    phone: "0544-25-2061",
    hours: "10:00 - 17:30"
  },
  { 
    id: 9, 
    name: "まかいの牧場", 
    description: "富士山を望む高原で動物と触れ合える体験型牧場。", 
    address: "静岡県富士宮市内野1327-1", 
    image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80", 
    lat: 35.328, 
    lng: 138.579,
    phone: "0544-54-0342",
    hours: "9:30 - 17:30"
  },
  { 
    id: 10, 
    name: "富士花鳥園", 
    description: "一年中満開の花々とフクロウに出会える癒しのテーマパーク。", 
    address: "静岡県富士宮市根原480-1", 
    image: "https://images.unsplash.com/photo-1571173674697-7573f0c11f7c?auto=format&fit=crop&w=800&q=80", 
    lat: 35.405, 
    lng: 138.583,
    phone: "0544-52-0880",
    hours: "9:00 - 17:00"
  },
  { 
    id: 11, 
    name: "狩宿の下馬桜", 
    description: "源頼朝ゆかりの国指定特別天然記念物。日本最古級のヤマザクラ。", 
    address: "静岡県富士宮市狩宿", 
    image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80", 
    lat: 35.289, 
    lng: 138.576,
    phone: "0544-27-5240",
    hours: "見学自由"
  },
  { 
    id: 12, 
    name: "陣馬の滝", 
    description: "源頼朝が巻狩りの際に陣を張ったと伝わる、清涼感あふれる滝。", 
    address: "静岡県富士宮市猪之頭", 
    image: "https://images.unsplash.com/photo-1546255345-42f27918413e?auto=format&fit=crop&w=800&q=80", 
    lat: 35.361, 
    lng: 138.544,
    phone: "0544-27-5240",
    hours: "散策自由"
  },
];

export const PRIZES: Prize[] = [
  { id: 1, name: "オークラ オリジナルシャンプー", description: "40周年記念限定ラベル。髪本来の美しさを引き出します。", requiredStamps: 3, image: "https://picsum.photos/400/400?random=100" },
  { id: 2, name: "ヘッドスパ 無料体験チケット", description: "至福のリラックスタイム。頭皮の汚れを落としリフレッシュ。", requiredStamps: 6, image: "https://picsum.photos/400/400?random=101" },
  { id: 3, name: "トリートメント グレードアップ", description: "いつものメニューにプラスして、ワンランク上の艶髪へ。", requiredStamps: 9, image: "https://picsum.photos/400/400?random=102" },
  { id: 4, name: "オークラ スペシャルギフトセット", description: "厳選されたヘアケア商品詰め合わせ。40周年の感謝を込めて。", requiredStamps: 12, image: "https://picsum.photos/400/400?random=103" },
];