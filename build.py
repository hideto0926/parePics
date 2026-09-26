"""pairPics の Web ページ（日英のトップとプライバシーポリシー）を生成する。

使い方: python3 web/build.py
公開前に CONTACT_EMAIL と APP_STORE_URL を設定してください。
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))

CONTACT_EMAIL = "[CONTACT_EMAIL]"   # お問い合わせ先のメールアドレス
APP_STORE_URL = "https://apps.apple.com/jp/app/pairpics/id6814495545"  # App Store のページの URL
UPDATED = {"ja": "2026年9月21日", "en": "September 21, 2026"}

T = {
    "ja": {
        "html_lang": "ja",
        "title": "pairPics — 組み写真を、壁に飾る。",
        "description": "pairPicsは、何枚かの写真をひとつの作品として、美術館の壁に掛けるように仕立てるiPhoneアプリです。",
        "eyebrow": "Photo sets, framed on the wall",
        "h1": "組み写真を、<br>壁に飾る。",
        "lead": "pairPicsは、何枚かの写真をひとつの作品として見せるためのiPhoneアプリです。上質な壁に、額とマットを選んで掛け、投稿する順番どおりに書き出します。",
        "store": "App Storeでダウンロード",
        "store_soon": "App Storeにて近日公開",
        "gal_eyebrow": "Three galleries",
        "gal_h": "3つのギャラリー",
        "gal_intro": "壁に掛けるウォールモードのほかに、組み写真を飾る場所を3つ用意しました。森、コンクリートの美術館、海の見えるガラスの展示室。どこで見せるかで、同じ写真の表情が変わります。",
        "gal_hint": "動かすと見回せます・スクロールで奥へ",
        "galleries": [
            {"key": "forest", "no": "01", "en": "Forest", "h": "森の美術館",
             "lead": "木漏れ日の森に、額が静かに浮かびます。小道をゆっくり歩きながら、一枚ずつ出会っていく展示です。",
             "points": ["実写の森に、霧と光の柱。後ろの木々は風でゆらゆらと揺れます",
                        "額は目の高さに浮かび、小道の左右に振り分けて並びます",
                        "動画では、木漏れ日がレンズに入って一瞬きらりと光ります"],
             "plates": [("forest_2.jpg", "浮かぶ額の正面"), ("forest_3.jpg", "木漏れ日の中の一枚"), ("forest_4.jpg", "最後の一枚（キー写真）")]},
            {"key": "museum", "no": "02", "en": "Concrete museum", "h": "コンクリートの美術館",
             "lead": "打ちっぱなしのコンクリートの入口から、天井の高い廊下を抜けて、光の差す大きな展示室へ。最後の一枚は、見上げるほどの大きさで。",
             "points": ["入口・廊下・突き当たり・展示室に、どの写真を置くかを選べます",
                        "展示室の一枚は、額もマットもないアクリルパネルで縦16mまで",
                        "スポットの光、金色の球体、半透明の人影が大きさを伝えます。歩いて巡る動画は15〜60秒"],
             "plates": [("museum_2.jpg", "入口の壁"), ("museum_3.jpg", "暗い廊下と人影"), ("museum_4.jpg", "展示室の大きな一枚")]},
            {"key": "sea", "no": "03", "en": "Glass gallery by the sea", "h": "海のガラス美術館",
             "lead": "一面のガラスの向こうに、凪いだ海と小島。組み写真をガラス面に掛けると、磨かれた床に空と額が映り込みます。",
             "points": ["朝・真昼・午後・夕暮れ・曇りの5つの時間帯から選べます",
                        "並びの型・額縁・マット・タイトルは、ウォールモードと同じように選べます",
                        "動画では、ガラスの向こうの海がきらめきます"],
             "plates": [("sea_2.jpg", "真昼"), ("sea_3.jpg", "夕暮れ"), ("sea_4.jpg", "動画の一コマ")],
             "lights": [("morning", "朝"), ("noon", "真昼"), ("dusk", "夕暮れ"), ("cloudy", "曇り")]},
        ],
        "shots_h": "スクリーンショット",
        "features_h": "特長",
        "features_intro": "写真の一枚一枚より、組み写真としての佇まいを大切にしました。",
        "features": [
            ("1枚から15枚まで", "大小を組み合わせた配置の型を枚数ごとに約20通り。ボタンひとつで入れ替え、一つ前にも戻せます。"),
            ("写真ごとのフレーミング", "比率と切り取る範囲を指で決められます。スクリーンショットの黒やグレーの帯は自動で取り除きます。"),
            ("上質な壁と額縁", "石灰の白、大理石、胡桃の羽目板など壁8種。金箔から縁のないアクリルパネルまで額縁9種。額の太さやスポットライトも選べます。"),
            ("写真に合わせるマット", "マット紙は写真の色味に合わせて一枚ずつ変わります。二重マットや麻など8種から選ぶこともできます。"),
            ("2種類のフィルム", "やわらかフィルムと、くすんだネガの風合いのストリートネガ。オリジナルと見比べ、強さを選んで適用できます。"),
            ("写真を巡る動画", "3〜30秒。全体の引きから1枚に着地し、何枚かを巡って、最後に注目の写真を画面いっぱいに。額のガラスに光が映り込みます。"),
        ],
        "how_h": "使い方",
        "steps": [
            "組み写真の枚数を選ぶ",
            "写真を選び、フレーミングを整える",
            "壁・額縁・マットを選び、配置を決める",
            "見てほしい場所を指で示す（任意）",
            "書き出して、番号の順にInstagramへ投稿する",
        ],
        "privacy_h": "プライバシー",
        "privacy_summary": "写真はすべて端末の中だけで処理されます。アカウント登録はなく、個人情報を集めることもありません。",
        "privacy_link": "プライバシーポリシーを読む",
        "footer_privacy": "プライバシーポリシー",
        "footer_contact": "お問い合わせ",
        "footer_home": "トップ",
        # プライバシーポリシー
        "p_title": "プライバシーポリシー — pairPics",
        "p_h1": "プライバシーポリシー",
        "p_updated": "最終更新日：",
        "p_body": """
<p>pairPics（以下「本アプリ」）は、利用者のプライバシーを大切にします。本ポリシーでは、本アプリが扱う情報とその取り扱いについて説明します。</p>

<h2>1. 収集する情報</h2>
<p>本アプリは、氏名、メールアドレス、位置情報、端末の識別子などの個人情報を収集しません。アカウント登録もありません。</p>

<h2>2. 写真の取り扱い</h2>
<ul>
<li>利用者が選んだ写真は、組み写真の作成のためだけに、端末の中で処理されます。</li>
<li>本アプリが写真をサーバーなど外部へ送信することはありません。</li>
<li>写真の選択にはiOSの写真ピッカーを使います。本アプリがアクセスできるのは、利用者が選んだ写真だけです。</li>
<li>書き出した画像と動画は、利用者が「写真に保存」を選んだときに、写真ライブラリへ追加されます（追加のみの許可を使います）。</li>
<li>「共有」を選んだ場合は、利用者が選んだ送り先のアプリへ画像が渡されます。送り先での取り扱いは、それぞれのサービスのポリシーに従います。</li>
</ul>

<h2>3. 端末に保存する情報</h2>
<p>チュートリアルを見たかどうかなど、本アプリの動作に必要な設定だけを端末内に保存します。これらが外部に送られることはありません。</p>

<h2>4. 通信・解析・広告</h2>
<p>本アプリはインターネット通信を行いません。利用状況の解析ツール、広告、トラッキングは使用していません。</p>

<h2>5. 第三者への提供</h2>
<p>本アプリは情報を収集しないため、第三者へ情報を提供することはありません。</p>

<h2>6. お子さまのプライバシー</h2>
<p>本アプリは年齢を問わず、個人情報を収集しません。</p>

<h2>7. 本ポリシーの変更</h2>
<p>本ポリシーを変更する場合は、このページでお知らせします。</p>

<h2>8. お問い合わせ</h2>
<p>本ポリシーに関するお問い合わせは、<a href="mailto:{email}">{email}</a> までご連絡ください。</p>
""",
    },
    "en": {
        "html_lang": "en",
        "title": "pairPics — Photo sets, framed on the wall.",
        "description": "pairPics is an iPhone app that presents several photos as a single work, framed as if hanging on a gallery wall.",
        "eyebrow": "Photo sets, framed on the wall",
        "h1": "Hang your photo set<br>on the wall.",
        "lead": "pairPics is an iPhone app for presenting several photos as a single work. Choose a fine wall, a frame and a mat, then export everything in the order you’ll post it.",
        "store": "Download on the App Store",
        "store_soon": "Coming soon to the App Store",
        "gal_eyebrow": "Three galleries",
        "gal_h": "Three galleries",
        "gal_intro": "Beyond the classic wall, there are three places to show your photo set: a forest, a concrete museum and a glass gallery by the sea. The same photos take on a different character in each.",
        "gal_hint": "Move to look around · scroll to walk in",
        "galleries": [
            {"key": "forest", "no": "01", "en": "Forest", "h": "The Forest Gallery",
             "lead": "Frames float quietly in a sunlit forest. Walk slowly along the path and meet your photos one at a time.",
             "points": ["A real forest with mist and shafts of light, the trees swaying gently in the wind",
                        "Frames float at eye level, placed on either side of the path",
                        "In the video, sunlight through the leaves catches the lens for a brief glint"],
             "plates": [("forest_2.jpg", "A floating frame"), ("forest_3.jpg", "In the dappled light"), ("forest_4.jpg", "The last photo (key photo)")]},
            {"key": "museum", "no": "02", "en": "Concrete museum", "h": "The Concrete Museum",
             "lead": "From a raw-concrete entrance, through a tall corridor, into a great hall filled with light. The final photo is big enough to look up at.",
             "points": ["Choose which photos go in the entrance, the corridor, at its end and in the hall",
                        "The hall photo is an unframed acrylic panel up to 16 meters tall",
                        "Spotlights, golden spheres and translucent figures give a sense of scale. Walk-through videos run 15 to 60 seconds"],
             "plates": [("museum_2.jpg", "The entrance wall"), ("museum_3.jpg", "A dim corridor"), ("museum_4.jpg", "The great hall")]},
            {"key": "sea", "no": "03", "en": "Glass gallery by the sea", "h": "The Glass Gallery by the Sea",
             "lead": "Beyond a wall of glass, a calm sea and a small island. Hang your photo set on the glass, and the polished floor reflects the sky and the frames.",
             "points": ["Five times of day: morning, noon, afternoon, dusk and overcast",
                        "Arrangements, frames, mats and titles work just like the wall mode",
                        "In the video, the sea beyond the glass glitters"],
             "plates": [("sea_2.jpg", "Noon"), ("sea_3.jpg", "Dusk"), ("sea_4.jpg", "A frame from the video")],
             "lights": [("morning", "Morning"), ("noon", "Noon"), ("dusk", "Dusk"), ("cloudy", "Overcast")]},
        ],
        "shots_h": "Screenshots",
        "features_h": "Features",
        "features_intro": "Designed around the quiet presence of a photo set, rather than any single image.",
        "features": [
            ("One to fifteen photos", "About 20 arrangements of large and small frames for each count. Shuffle with a tap, and step back anytime."),
            ("Framing for each photo", "Set the ratio and crop by hand. Black or gray screenshot borders are removed automatically."),
            ("Fine walls and frames", "Eight walls — limewash, marble, walnut paneling and more — and nine frames, from gilded to a frameless acrylic panel. Choose the frame width and add a spotlight."),
            ("Mats that match", "The mat adapts to the tones of each photo, or choose from eight mats, including double and linen."),
            ("Two film looks", "Soft Film and a muted Street Negative. Compare with the original and choose the strength."),
            ("Video tours", "3 to 30 seconds — from a wide shot to one photo, a gentle glide across others, and the key photo to finish, with light on the glass."),
        ],
        "how_h": "How it works",
        "steps": [
            "Choose how many photos",
            "Pick your photos and adjust their framing",
            "Choose a wall, frame and mat, and arrange the frames",
            "Point to what matters (optional)",
            "Export, then post to Instagram in numbered order",
        ],
        "privacy_h": "Privacy",
        "privacy_summary": "All photos are processed on your device. There’s no account, and no personal information is collected.",
        "privacy_link": "Read the privacy policy",
        "footer_privacy": "Privacy Policy",
        "footer_contact": "Contact",
        "footer_home": "Home",
        "p_title": "Privacy Policy — pairPics",
        "p_h1": "Privacy Policy",
        "p_updated": "Last updated: ",
        "p_body": """
<p>pairPics (“the App”) respects your privacy. This policy explains what information the App handles and how.</p>

<h2>1. Information we collect</h2>
<p>The App does not collect personal information such as your name, email address, location or device identifiers. There is no account to create.</p>

<h2>2. Your photos</h2>
<ul>
<li>The photos you choose are processed on your device, solely to create your photo set.</li>
<li>The App never sends your photos to any server or other external destination.</li>
<li>Photos are chosen with the iOS photo picker, so the App can access only the photos you select.</li>
<li>Exported images and videos are added to your photo library only when you choose “Save to Photos” (using add-only access).</li>
<li>If you choose “Share,” the images are handed to the app you select. How they are handled there is governed by that service’s own policy.</li>
</ul>

<h2>3. Information stored on your device</h2>
<p>The App stores only the settings it needs to work, such as whether you have seen the tutorial. This information never leaves your device.</p>

<h2>4. Network, analytics and advertising</h2>
<p>The App does not connect to the internet. It uses no analytics tools, advertising or tracking.</p>

<h2>5. Sharing with third parties</h2>
<p>Because the App collects no information, it shares none with third parties.</p>

<h2>6. Children’s privacy</h2>
<p>The App does not collect personal information from anyone, regardless of age.</p>

<h2>7. Changes to this policy</h2>
<p>If this policy changes, the update will be posted on this page.</p>

<h2>8. Contact</h2>
<p>For questions about this policy, please contact <a href="mailto:{email}">{email}</a>.</p>
""",
    },
}


def head(t, title, root, alternate_ja, alternate_en):
    return f"""<!doctype html>
<html lang="{t['html_lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{t['description']}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{t['description']}">
<meta property="og:image" content="{root}assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{root}assets/favicon.png">
<link rel="apple-touch-icon" href="{root}assets/apple-touch-icon.png">
<link rel="alternate" hreflang="ja" href="{alternate_ja}">
<link rel="alternate" hreflang="en" href="{alternate_en}">
<link rel="stylesheet" href="{root}assets/style.css">
<script type="importmap">{{"imports": {{"three": "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js", "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/"}}}}</script>
</head>
<body>
"""


def header(lang, root, ja_href, en_href):
    langs = (f'<strong>日本語</strong> / <a href="{en_href}" hreflang="en">English</a>' if lang == "ja"
             else f'<a href="{ja_href}" hreflang="ja">日本語</a> / <strong>English</strong>')
    home = root if lang == "ja" else root + "en/"
    return f"""<header class="site-header">
  <div class="wrap">
    <a class="brand" href="{home}"><img src="{root}assets/icon.png" alt=""><span>pairPics</span></a>
    <nav class="lang" aria-label="Language">{langs}</nav>
  </div>
</header>
"""


def footer(t, lang, root):
    home = root if lang == "ja" else root + "en/"
    privacy = root + ("privacy.html" if lang == "ja" else "en/privacy.html")
    return f"""<footer class="site-footer">
  <div class="wrap">
    <span>© 2026 pairPics</span>
    <nav>
      <a href="{home}">{t['footer_home']}</a>
      <a href="{privacy}">{t['footer_privacy']}</a>
      <a href="mailto:{CONTACT_EMAIL}">{t['footer_contact']}</a>
    </nav>
  </div>
</footer>
</body>
</html>
"""


def galleries(t, root):
    nav = "\n".join(f'      <a href="#g-{g['key']}"><span>{g['no']}</span>{g['h']}</a>' for g in t["galleries"])
    blocks = []
    for g in t["galleries"]:
        points = "\n".join(f"          <li>{p}</li>" for p in g["points"])
        plates = "\n".join(f'''      <figure><img src="{root}assets/gallery/{src}" alt="{cap}" loading="lazy" width="720" height="900"><figcaption>{cap}</figcaption></figure>'''
                            for src, cap in g["plates"])
        lights = ""
        if g.get("lights"):
            buttons = "".join(f'<button type="button" data-light="{k}" aria-pressed="{str(k == "noon").lower()}">{name}</button>' for k, name in g["lights"])
            lights = f'\n        <div class="g-lights">{buttons}</div>'
        blocks.append(f"""<section class="gallery gallery-{g['key']}" id="g-{g['key']}">
  <div class="wrap">
    <div class="g-grid">
      <div class="g-stage" data-g3d="{g['key']}" data-root="{root}">
        <img src="{root}assets/gallery/{g['key']}_1.jpg" alt="{g['h']}" width="720" height="900">
        <span class="g-hint">{t['gal_hint']}</span>{lights}
      </div>
      <div class="g-text">
        <p class="eyebrow">Gallery {g['no']} — {g['en']}</p>
        <h2>{g['h']}</h2>
        <p class="lead">{g['lead']}</p>
        <ul class="g-points">
{points}
        </ul>
      </div>
    </div>
    <div class="g-plates">
{plates}
    </div>
  </div>
</section>
""")
    return f"""<section class="galleries-intro">
  <div class="wrap">
    <p class="eyebrow">{t['gal_eyebrow']}</p>
    <h2>{t['gal_h']}</h2>
    <p class="intro">{t['gal_intro']}</p>
    <nav class="g-nav">
{nav}
    </nav>
  </div>
</section>
""" + "".join(blocks)


def home_page(lang):
    t = T[lang]
    root = "" if lang == "ja" else "../"
    ja_href, en_href = ("./", "en/") if lang == "ja" else ("../", "./")
    store = (f'<a class="store-button" href="{APP_STORE_URL}">{t["store"]}</a>' if APP_STORE_URL
             else f'<span class="store-button" aria-disabled="true">{t["store_soon"]}</span>')
    shots = "\n".join(f'      <img src="{root}assets/screens/{lang}_{i:02d}.jpg" alt="" loading="lazy" width="642" height="1389">'
                      for i in range(1, 7))
    features = "\n".join(f"""      <div class="feature"><span class="num">{i:02d}</span><h3>{h}</h3><p>{p}</p></div>"""
                         for i, (h, p) in enumerate(t["features"], 1))
    steps = "\n".join(f"      <li>{s}</li>" for s in t["steps"])
    privacy = root + ("privacy.html" if lang == "ja" else "en/privacy.html")
    return head(t, t["title"], root, "../" if lang == "en" else "./", "./" if lang == "en" else "en/") + header(lang, root, ja_href, en_href) + f"""<main>
<div class="hero">
  <div class="wrap">
    <div>
      <img class="icon-large" src="{root}assets/icon.png" alt="pairPics" width="88" height="88">
      <p class="eyebrow">{t['eyebrow']}</p>
      <h1>{t['h1']}</h1>
      <p class="lead">{t['lead']}</p>
      {store}
    </div>
    <div class="hero-stage" data-hero3d data-texture="{root}assets/wall-2160.jpg" data-frames="{root}assets/frames.json">
      <img src="{root}assets/wall.jpg" alt="" width="1080" height="1350">
    </div>
  </div>
</div>

{galleries(t, root)}
<section>
  <div class="wrap">
    <h2>{t['shots_h']}</h2>
    <div class="screens">
{shots}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>{t['features_h']}</h2>
    <p class="intro">{t['features_intro']}</p>
    <div class="features">
{features}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>{t['how_h']}</h2>
    <ol class="steps">
{steps}
    </ol>
  </div>
</section>

<section>
  <div class="wrap">
    <h2>{t['privacy_h']}</h2>
    <p class="intro">{t['privacy_summary']}</p>
    <a href="{privacy}">{t['privacy_link']}</a>
  </div>
</section>
</main>
<script type="module" src="{root}assets/hero3d.js"></script>
<script type="module" src="{root}assets/galleries3d.js"></script>
""" + footer(t, lang, root)


def privacy_page(lang):
    t = T[lang]
    root = "" if lang == "ja" else "../"
    ja_href, en_href = ("privacy.html", "en/privacy.html") if lang == "ja" else ("../privacy.html", "privacy.html")
    body = t["p_body"].replace("{email}", CONTACT_EMAIL)
    return head(t, t["p_title"], root, ja_href, en_href) + header(lang, root, ja_href, en_href) + f"""<main class="doc">
  <div class="wrap">
    <h1>{t['p_h1']}</h1>
    <p class="updated">{t['p_updated']}{UPDATED[lang]}</p>
{body}
  </div>
</main>
""" + footer(t, lang, root)


def write(path, text):
    full = os.path.join(HERE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(text)


if __name__ == "__main__":
    write("index.html", home_page("ja"))
    write("en/index.html", home_page("en"))
    write("privacy.html", privacy_page("ja"))
    write("en/privacy.html", privacy_page("en"))
    print("built")
