import { appFooter, browseHeader, bottomNav } from "./shared_page_markup.js";

export const defaultView = "goods";

export const pages = {
  artists: {
    page: "artist_search.html",
    title: "アーティストから探す | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js"],
    markup: `
    <main class="app_shell">
      ${browseHeader}
      <section class="search_intro">
        <span class="search_choice__visual search_choice__visual--artist" aria-hidden="true">
          <img src="assets/images/artists.png" alt="" />
        </span>
        <div>
          <h1>アーティスト</h1>
          <p>
            アーティスト・グループ名から
            <br />
            レンタルしたいアイテムを探せます
          </p>
        </div>
      </section>
      <form action="search.html" class="app_search app_search--separate">
        <span aria-hidden="true">⌕</span>
        <input
          name="artist"
          required
          aria-label="アーティスト検索"
          placeholder="アーティスト名で検索"
        />
      </form>
      <section class="artist_content">
        <h2>近日ライブ</h2>
        <div class="artist_grid">
          <button class="artist_item" type="button" data-artist-select data-artist-id="lumina">
            <span class="artist_avatar artist_avatar--1"></span>
            <b>LUMINA</b>
          </button>
          <button class="artist_item" type="button" data-artist-select data-artist-id="sora-note">
            <span class="artist_avatar artist_avatar--2"></span>
            <b>SORA NOTE</b>
          </button>
          <button class="artist_item" type="button" data-artist-select data-artist-id="mint-parade">
            <span class="artist_avatar artist_avatar--3"></span>
            <b>MINT PARADE</b>
          </button>
          <button class="artist_item" type="button" data-artist-select data-artist-id="vivid-loop">
            <span class="artist_avatar artist_avatar--4"></span>
            <b>VIVID LOOP</b>
          </button>
        </div>
        <h2>人気アーティスト</h2>
        <div class="artist_grid">
          <button class="artist_item" type="button" data-artist-select data-artist-id="nocturne">
            <span class="artist_avatar artist_avatar--5"></span>
            <b>NOCTURNE</b>
          </button>
          <button class="artist_item" type="button" data-artist-select data-artist-id="snow-drop">
            <span class="artist_avatar artist_avatar--6"></span>
            <b>SNOW DROP</b>
          </button>
          <button class="artist_item" type="button" data-artist-select data-artist-id="coral-beat">
            <span class="artist_avatar artist_avatar--7"></span>
            <b>CORAL BEAT</b>
          </button>
          <button class="artist_item" type="button" data-artist-select data-artist-id="sunny-days">
            <span class="artist_avatar artist_avatar--8"></span>
            <b>SUNNY DAYS</b>
          </button>
        </div>
        <h2>最近見たアーティスト</h2>
        <div class="search_chips">
          <button type="button">LUMINA</button>
          <button type="button">MINT PARADE</button>
          <button type="button">SUNNY DAYS</button>
        </div>
      </section>
      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  goods: {
    page: "goods_search.html",
    title: "汎用品から探す | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js"],
    markup: `
    <main class="app_shell">
      ${browseHeader}
      <section class="search_intro search_intro--goods">
        <span class="search_choice__visual search_choice__visual--penlight">
          <img src="assets/images/penillust.png" alt="" />
        </span>
        <div>
          <h1>汎用品</h1>
          <p>
            どのライブでも使えるアイテムから
            <br />
            レンタルしたいアイテムを探せます。
          </p>
        </div>
      </section>
      <form action="search.html" class="app_search app_search--separate">
        <span aria-hidden="true">⌕</span>
        <input name="keyword" required aria-label="汎用品検索" placeholder="グッズ名で検索" />
      </form>
      <section class="goods_content">
        <div class="goods_grid">
          <a href="search.html?category=penlight">
            <span class="goods_grid__penlight_image">
              <img src="assets/images/pennraito.png" alt="" />
            </span>
            <b>ペンライト</b>
          </a>
          <a href="search.html?category=fan">
            <span><img src="assets/images/utiwa.png" alt="" /></span>
            <b>うちわ</b>
          </a>
          <a href="browse.html?view=binoculars">
            <span>
              <img src="assets/images/sougannkyou.png" alt="" />
            </span>
            <b>双眼鏡</b>
          </a>
          <a href="search.html?category=bag">
            <span>
              <img src="assets/images/bag.png" alt="" />
            </span>
            <b>バッグ</b>
          </a>
          <a class="goods_grid__set" href="search.html?category=set">
            <span>
              <img src="assets/images/setto.png" alt="" />
            </span>
            <b>セット</b>
          </a>
        </div>
      </section>
      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  binoculars: {
    page: "binocular_filter.html",
    title: "双眼鏡を選ぶ | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js"],
    markup: `
    <main class="app_shell binocular_filter_page">
      ${browseHeader}

      <section class="binocular_filter_intro" aria-labelledby="binocular-filter-title">
        <div class="binocular_filter_intro__image">
          <img src="assets/images/sougannkyou.png" alt="双眼鏡" />
        </div>
        <div>
          <h1 id="binocular-filter-title">双眼鏡</h1>
          <p>
            ライブをもっと近くで楽しむためのアイテム
            <br />
            8倍から16倍までの倍率や、防振・防水機能の双眼鏡を幅広く取り揃えています。
          </p>
        </div>
      </section>

      <form action="search.html" class="app_search binocular_filter_search">
        <span aria-hidden="true">⌕</span>
        <input
          name="keyword"
          required
          aria-label="アーティスト名・ライブ会場・グッズで検索"
          placeholder="アーティスト名・ライブ会場・グッズで検索"
        />
      </form>

      <section class="binocular_filter_choices" aria-label="双眼鏡の絞り込み条件">
        <a href="search.html?category=binoculars&filter=8倍">8倍</a>
        <a href="search.html?category=binoculars&filter=10倍">10倍</a>
        <a href="search.html?category=binoculars&filter=12倍">12倍</a>
        <a href="search.html?category=binoculars&filter=14倍">14倍</a>
        <a href="search.html?category=binoculars&filter=16倍">16倍</a>
        <a href="search.html?category=binoculars&filter=防振">防振</a>
        <a href="search.html?category=binoculars&filter=防水">防水</a>
      </section>

      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },
};
