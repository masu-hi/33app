import { appFooter, accountHeader, bottomNav } from "./shared_page_markup.js";

export const defaultView = "profile";

export const pages = {
  profile: {
    page: "member_info.html",
    title: "会員情報 | おしりーす",
    bodyAttributes: { class: "mobile_app is_product_data_loading", "aria-busy": "true" },
    scripts: [
      "user_storage.js",
      "theme_init.js",
      "birthday_fields.js",
      "module:profile_bootstrap.js",
    ],
    markup: `
    <div class="product_data_loading" data-product-data-loading role="status">
      <span class="product_data_loading__spinner" aria-hidden="true"></span>
      会員情報を読み込んでいます
    </div>
    <main class="app_shell member_info_page">
      ${accountHeader}

      <section class="member_info" aria-labelledby="member-info-title" data-member-info>
        <h1 id="member-info-title">会員情報</h1>
        <p class="member_info__intro" data-member-intro>登録されている会員情報を確認できます。</p>
        <div class="member_info__view" data-member-view>
          <dl class="member_info__list">
            <div>
              <dt>お名前</dt>
              <dd data-member-value="name">未登録</dd>
            </div>
            <div>
              <dt>フリガナ</dt>
              <dd data-member-value="kana">未登録</dd>
            </div>
            <div>
              <dt>電話番号</dt>
              <dd data-member-value="phone">未登録</dd>
            </div>
            <div>
              <dt>生年月日</dt>
              <dd data-member-value="birthday">未登録</dd>
            </div>
            <div>
              <dt>郵便番号</dt>
              <dd data-member-value="postal">未登録</dd>
            </div>
            <div>
              <dt>住所</dt>
              <dd data-member-value="address">未登録</dd>
            </div>
            <div>
              <dt>建物名・部屋番号</dt>
              <dd data-member-value="building">未登録</dd>
            </div>
            <div>
              <dt>メールアドレス</dt>
              <dd data-member-value="email">未登録</dd>
            </div>
            <div>
              <dt>推しカラー</dt>
              <dd data-member-value="favorite_color">未登録</dd>
            </div>
          </dl>
          <button class="member_info__edit_button" type="button" data-member-edit>
            登録情報を変更する
          </button>
        </div>
        <form class="member_info__form" data-member-edit-form hidden>
          <label>
            お名前
            <input name="name" required autocomplete="name" />
          </label>
          <label>
            フリガナ
            <input name="kana" required />
          </label>
          <label>
            電話番号
            <input name="phone" type="tel" required autocomplete="tel" pattern="[0-9\\-]{10,13}" />
          </label>
          <fieldset class="member_info__birth_fields" data-birthday-fields>
            <legend>生年月日</legend>
            <div>
              <select name="birth_year" required aria-label="生まれた年" autocomplete="bday-year">
                <option value="">0000</option>
              </select>
              <span>年</span>
              <select name="birth_month" required aria-label="生まれた月" autocomplete="bday-month">
                <option value="">00</option>
              </select>
              <span>月</span>
              <select name="birth_day" required aria-label="生まれた日" autocomplete="bday-day">
                <option value="">00</option>
              </select>
              <span>日</span>
            </div>
          </fieldset>
          <fieldset class="postal_fields member_info__postal_fieldset">
            <legend>郵便番号</legend>
            <div>
              <input
                name="postal_first"
                required
                inputmode="numeric"
                pattern="[0-9]{3}"
                maxlength="3"
                placeholder="123"
              />
              <span>-</span>
              <input
                name="postal_last"
                required
                inputmode="numeric"
                pattern="[0-9]{4}"
                maxlength="4"
                placeholder="4567"
              />
              <button type="button" data-member-address-search>住所検索</button>
            </div>
            <p class="postal_status" data-member-postal-status role="status"></p>
          </fieldset>
          <label>
            都道府県
            <input name="prefecture" required />
          </label>
          <label>
            市区町村番地
            <input name="address" required autocomplete="street-address" />
          </label>
          <label>
            建物名・部屋番号
            <input name="building" />
          </label>
          <label>
            メールアドレス
            <input name="email" type="email" autocomplete="email" readonly />
          </label>
          <label>
            推しカラー
            <select name="favorite_color" required>
              <option value="">選択してください</option>
              <option>赤</option>
              <option>青</option>
              <option>ピンク</option>
              <option>紫</option>
              <option>緑</option>
              <option>黄色</option>
              <option>オレンジ</option>
              <option>水色</option>
              <option>白</option>
              <option>黒</option>
            </select>
          </label>
          <a href="auth.html?view=reset">パスワードを再設定する</a>
          <p class="account_form__error" data-member-form-error role="alert"></p>
          <div class="member_info__form_actions">
            <button type="button" data-member-edit-cancel>キャンセル</button>
            <button type="submit">変更を保存する</button>
          </div>
        </form>
      </section>

      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  color: {
    page: "color_change.html",
    title: "推しカラー変更 | おしりーす",
    bodyAttributes: { class: "mobile_app is_product_data_loading", "aria-busy": "true" },
    scripts: ["user_storage.js", "theme_init.js", "module:profile_bootstrap.js"],
    markup: `
    <div class="product_data_loading" data-product-data-loading role="status">
      <span class="product_data_loading__spinner" aria-hidden="true"></span>
      会員情報を読み込んでいます
    </div>
    <main class="app_shell">
      ${accountHeader}
      <section class="color_change_page" aria-labelledby="color-change-title">
        <a class="color_change_page__account_title" href="account.html?view=profile">会員情報</a>
        <a class="color_change_page__card_link" href="account.html?view=password">パスワード設定</a>
        <a class="color_change_page__card_link" href="account.html?view=card">
          クレジットカードの登録変更・追加
        </a>
        <h2 id="color-change-title" class="color_change_page__title">推しカラー変更</h2>
        <div class="color_change_page__choices" role="group" aria-label="推しカラーを選択">
          <button class="color_button color_button--red" type="button" data-favorite-color="赤">
            赤
          </button>
          <button class="color_button color_button--blue" type="button" data-favorite-color="青">
            青
          </button>
          <button
            class="color_button color_button--pink"
            type="button"
            data-favorite-color="ピンク"
          >
            ピンク
          </button>
          <button class="color_button color_button--aqua" type="button" data-favorite-color="水色">
            水色
          </button>
          <button
            class="color_button color_button--orange"
            type="button"
            data-favorite-color="オレンジ"
          >
            オレンジ
          </button>
          <button class="color_button color_button--purple" type="button" data-favorite-color="紫">
            紫
          </button>
          <button
            class="color_button color_button--yellow"
            type="button"
            data-favorite-color="黄色"
          >
            黄色
          </button>
          <button class="color_button color_button--green" type="button" data-favorite-color="緑">
            緑
          </button>
          <button class="color_button color_button--white" type="button" data-favorite-color="白">
            白
          </button>
          <button class="color_button color_button--black" type="button" data-favorite-color="黒">
            黒
          </button>
        </div>
        <p class="color_change_page__status" data-color-status role="status"></p>
      </section>
      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  password: {
    page: "password_setting.html",
    title: "パスワード設定 | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js", "password_toggle.js"],
    markup: `
    <main class="app_shell password_setting_page">
      ${accountHeader}

      <section class="password_setting" aria-labelledby="password-setting-title">
        <h1 id="password-setting-title">パスワード設定</h1>
        <p>パスワードを変更できます。</p>
        <form data-password-setting-form>
          <label>
            現在のパスワード
            <input
              name="current_password"
              type="password"
              required
              autocomplete="current-password"
            />
          </label>
          <label>
            新しいパスワード
            <input
              name="new_password"
              type="password"
              required
              minlength="8"
              pattern="[A-Za-z0-9]+"
              autocomplete="new-password"
            />
          </label>
          <label>
            新しいパスワード（確認）
            <input
              name="new_password_confirm"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
            />
          </label>
          <small>※半角英数字8桁以上で入力してください。</small>
          <p class="password_setting__status" data-password-setting-status role="status"></p>
          <button type="submit">パスワードを変更する</button>
        </form>
      </section>

      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  card: {
    page: "credit_card.html",
    title: "クレジットカードの登録・追加 | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js"],
    markup: `
    <main class="app_shell credit_card_page">
      ${accountHeader}

      <section class="credit_card" aria-labelledby="credit-card-title">
        <h1 id="credit-card-title">クレジットカードの登録・追加</h1>
        <p class="credit_card__intro">お支払いに使用するクレジットカードを登録できます。</p>
        <form class="credit_card__form">
          <label>
            カード番号
            <input
              name="card_number"
              type="text"
              inputmode="numeric"
              autocomplete="cc-number"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              required
            />
          </label>
          <div class="credit_card__form_row">
            <label>
              有効期限
              <span class="credit_card__expiry_inputs">
                <input
                  name="expiry_month"
                  type="text"
                  inputmode="numeric"
                  autocomplete="cc-exp-month"
                  placeholder="MM"
                  maxlength="2"
                  required
                />
                <b>/</b>
                <input
                  name="expiry_year"
                  type="text"
                  inputmode="numeric"
                  autocomplete="cc-exp-year"
                  placeholder="YY"
                  maxlength="2"
                  required
                />
              </span>
            </label>
            <label>
              セキュリティコード
              <input
                name="security_code"
                type="text"
                inputmode="numeric"
                autocomplete="cc-csc"
                placeholder="123"
                maxlength="4"
                required
              />
            </label>
          </div>
          <label>
            カード名義
            <input
              name="card_holder"
              type="text"
              autocomplete="cc-name"
              placeholder="TAROU YAMADA"
              required
            />
          </label>
          <p class="credit_card__note">※カードに記載されているローマ字で入力してください。</p>
          <button class="credit_card__submit" type="submit">このカードを登録する</button>
        </form>
        <p class="credit_card__security">🔒 お客様のカード情報は暗号化して安全に送信されます。</p>
      </section>

      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  favorites: {
    page: "favorites.html",
    title: "お気に入り | おしりーす",
    bodyAttributes: { class: "mobile_app is_product_data_loading", "aria-busy": "true" },
    scripts: [
      "user_storage.js",
      "theme_init.js",
      "product_data.js",
      "module:firebase_app_bootstrap.js",
    ],
    markup: `
    <div class="product_data_loading" data-product-data-loading role="status">
      <span class="product_data_loading__spinner" aria-hidden="true"></span>
      お気に入りを読み込んでいます
    </div>
    <main class="app_shell favorites_page" data-favorites-page>
      ${accountHeader}

      <section class="favorites_page__content">
        <h1>お気に入り</h1>
        <form action="search.html" class="app_search favorites_page__search">
          <span aria-hidden="true">⌕</span>
          <input
            name="keyword"
            required
            aria-label="お気に入りを検索"
            placeholder="お気に入りを検索"
          />
        </form>
        <p class="favorites_page__description">お気に入りに登録した商品が表示されます。</p>
        <div class="favorites_list" data-favorites-list></div>
        <div class="favorites_page__empty" data-favorites-empty hidden>
          <p>お気に入りはまだありません</p>
          <a href="home.html">商品を探す</a>
        </div>
      </section>

      ${appFooter}

      ${bottomNav}
    </main>
  
`,
  },

  recent: {
    page: "recently_viewed.html",
    title: "最近見た商品 | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "product_data.js", "app.js"],
    markup: `
    <main class="app_shell favorites_page recently_viewed_page" data-recently-viewed-page>
      ${accountHeader}

      <section class="favorites_page__content">
        <h1>最近見た商品</h1>
        <div class="favorites_list" data-recently-viewed-list></div>
        <div class="favorites_page__empty" data-recently-viewed-empty hidden>
          <p>最近見た商品はまだありません</p>
          <a href="home.html">商品を探す</a>
        </div>
      </section>

      ${appFooter}

      ${bottomNav}
    </main>
  
`,
  },

  checklist: {
    page: "packing_checklist.html",
    title: "持ち物チェックリスト | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js", "packing_checklist.js"],
    markup: `
    <main class="app_shell packing_checklist_page">
      ${accountHeader}

      <section class="packing_checklist_page__content">
        <header class="packing_checklist__header">
          <p class="packing_checklist__eyebrow">
            <span aria-hidden="true">✦</span>
            LIVE DAY
          </p>
          <h1>持ち物チェックリスト</h1>
          <p class="packing_checklist__tagline">準備もライブの楽しみのひとつ。</p>
          <div
            class="packing_checklist__progress"
            role="progressbar"
            aria-label="持ち物の準備状況"
            aria-valuemin="0"
            aria-valuemax="34"
            aria-valuenow="0"
            data-checklist-progress
          >
            <span data-checklist-progress-fill></span>
          </div>
          <div class="packing_checklist__summary">
            <p aria-live="polite">
              <strong data-checklist-count>0</strong>
              <span>
                /
                <span data-checklist-total>34</span>
                個チェック済み
              </span>
            </p>
            <button class="packing_checklist__reset" type="button" data-checklist-reset>
              すべて解除
            </button>
          </div>
          <p class="packing_checklist__feedback" aria-live="polite" data-checklist-message>
            推しに会う準備、はじめよう！
          </p>
        </header>

        <form class="packing_checklist__add" data-checklist-add-form>
          <label class="visually_hidden" for="checklist-new-item">持ち物を追加</label>
          <input
            id="checklist-new-item"
            type="text"
            name="new_item"
            maxlength="40"
            placeholder="持ち物を追加"
            data-checklist-new-item
            required
          />
          <button type="submit">
            <span aria-hidden="true">+</span>
            追加
          </button>
        </form>
        <p class="visually_hidden" aria-live="polite" data-checklist-status></p>
        <div class="packing_checklist" aria-label="持ち物一覧" data-checklist-list>
          <label class="packing_checklist__item" for="checklist-ticket">
            <input
              id="checklist-ticket"
              type="checkbox"
              name="packing_item"
              value="ticket"
              data-checklist-item
            />
            <span>チケット・電子チケット</span>
          </label>
          <label class="packing_checklist__item" for="checklist-phone">
            <input
              id="checklist-phone"
              type="checkbox"
              name="packing_item"
              value="phone"
              data-checklist-item
            />
            <span>スマートフォン</span>
          </label>
          <label class="packing_checklist__item" for="checklist-wallet">
            <input
              id="checklist-wallet"
              type="checkbox"
              name="packing_item"
              value="wallet"
              data-checklist-item
            />
            <span>財布・現金</span>
          </label>
          <label class="packing_checklist__item" for="checklist-id">
            <input
              id="checklist-id"
              type="checkbox"
              name="packing_item"
              value="id"
              data-checklist-item
            />
            <span>身分証明書</span>
          </label>
          <label class="packing_checklist__item" for="checklist-battery">
            <input
              id="checklist-battery"
              type="checkbox"
              name="packing_item"
              value="battery"
              data-checklist-item
            />
            <span>モバイルバッテリー</span>
          </label>
          <label class="packing_checklist__item" for="checklist-cable">
            <input
              id="checklist-cable"
              type="checkbox"
              name="packing_item"
              value="cable"
              data-checklist-item
            />
            <span>充電ケーブル</span>
          </label>
          <label class="packing_checklist__item" for="checklist-drink">
            <input
              id="checklist-drink"
              type="checkbox"
              name="packing_item"
              value="drink"
              data-checklist-item
            />
            <span>飲み物</span>
          </label>
          <label class="packing_checklist__item" for="checklist-handkerchief">
            <input
              id="checklist-handkerchief"
              type="checkbox"
              name="packing_item"
              value="handkerchief"
              data-checklist-item
            />
            <span>ハンカチ・ティッシュ</span>
          </label>
          <label class="packing_checklist__item" for="checklist-penlight">
            <input
              id="checklist-penlight"
              type="checkbox"
              name="packing_item"
              value="penlight"
              data-checklist-item
            />
            <span>ペンライト</span>
          </label>
          <label class="packing_checklist__item" for="checklist-penlight-battery">
            <input
              id="checklist-penlight-battery"
              type="checkbox"
              name="packing_item"
              value="penlight-battery"
              data-checklist-item
            />
            <span>ペンライト用電池・予備電池</span>
          </label>
          <label class="packing_checklist__item" for="checklist-uchiwa">
            <input
              id="checklist-uchiwa"
              type="checkbox"
              name="packing_item"
              value="uchiwa"
              data-checklist-item
            />
            <span>うちわ</span>
          </label>
          <label class="packing_checklist__item" for="checklist-fan-service-uchiwa">
            <input
              id="checklist-fan-service-uchiwa"
              type="checkbox"
              name="packing_item"
              value="fan-service-uchiwa"
              data-checklist-item
            />
            <span>ファンサうちわ</span>
          </label>
          <label class="packing_checklist__item" for="checklist-acrylic-stand">
            <input
              id="checklist-acrylic-stand"
              type="checkbox"
              name="packing_item"
              value="acrylic-stand"
              data-checklist-item
            />
            <span>アクリルスタンド</span>
          </label>
          <label class="packing_checklist__item" for="checklist-can-badge">
            <input
              id="checklist-can-badge"
              type="checkbox"
              name="packing_item"
              value="can-badge"
              data-checklist-item
            />
            <span>缶バッジ</span>
          </label>
          <label class="packing_checklist__item" for="checklist-trading-card">
            <input
              id="checklist-trading-card"
              type="checkbox"
              name="packing_item"
              value="trading-card"
              data-checklist-item
            />
            <span>トレカ</span>
          </label>
          <label class="packing_checklist__item" for="checklist-plush">
            <input
              id="checklist-plush"
              type="checkbox"
              name="packing_item"
              value="plush"
              data-checklist-item
            />
            <span>推しぬい・ぬいぐるみ</span>
          </label>
          <label class="packing_checklist__item" for="checklist-towel">
            <input
              id="checklist-towel"
              type="checkbox"
              name="packing_item"
              value="towel"
              data-checklist-item
            />
            <span>タオル</span>
          </label>
          <label class="packing_checklist__item" for="checklist-oshi-bag">
            <input
              id="checklist-oshi-bag"
              type="checkbox"
              name="packing_item"
              value="oshi-bag"
              data-checklist-item
            />
            <span>推し活バッグ</span>
          </label>
          <label class="packing_checklist__item" for="checklist-binoculars">
            <input
              id="checklist-binoculars"
              type="checkbox"
              name="packing_item"
              value="binoculars"
              data-checklist-item
            />
            <span>双眼鏡</span>
          </label>
          <label class="packing_checklist__item" for="checklist-goods-bag">
            <input
              id="checklist-goods-bag"
              type="checkbox"
              name="packing_item"
              value="goods-bag"
              data-checklist-item
            />
            <span>グッズを入れる袋</span>
          </label>
          <label class="packing_checklist__item" for="checklist-makeup">
            <input
              id="checklist-makeup"
              type="checkbox"
              name="packing_item"
              value="makeup"
              data-checklist-item
            />
            <span>メイク直し用品</span>
          </label>
          <label class="packing_checklist__item" for="checklist-lip">
            <input
              id="checklist-lip"
              type="checkbox"
              name="packing_item"
              value="lip"
              data-checklist-item
            />
            <span>リップ</span>
          </label>
          <label class="packing_checklist__item" for="checklist-mirror">
            <input
              id="checklist-mirror"
              type="checkbox"
              name="packing_item"
              value="mirror"
              data-checklist-item
            />
            <span>鏡</span>
          </label>
          <label class="packing_checklist__item" for="checklist-hair">
            <input
              id="checklist-hair"
              type="checkbox"
              name="packing_item"
              value="hair"
              data-checklist-item
            />
            <span>ヘアゴム・ヘアピン</span>
          </label>
          <label class="packing_checklist__item" for="checklist-sweat-sheet">
            <input
              id="checklist-sweat-sheet"
              type="checkbox"
              name="packing_item"
              value="sweat-sheet"
              data-checklist-item
            />
            <span>汗拭きシート</span>
          </label>
          <label class="packing_checklist__item" for="checklist-hand-fan">
            <input
              id="checklist-hand-fan"
              type="checkbox"
              name="packing_item"
              value="hand-fan"
              data-checklist-item
            />
            <span>ハンディファン</span>
          </label>
          <label class="packing_checklist__item" for="checklist-folding-umbrella">
            <input
              id="checklist-folding-umbrella"
              type="checkbox"
              name="packing_item"
              value="folding-umbrella"
              data-checklist-item
            />
            <span>折りたたみ傘</span>
          </label>
          <label class="packing_checklist__item" for="checklist-id-copy">
            <input
              id="checklist-id-copy"
              type="checkbox"
              name="packing_item"
              value="id-copy"
              data-checklist-item
            />
            <span>身分証明書のコピー</span>
          </label>
          <label class="packing_checklist__item" for="checklist-entry-code">
            <input
              id="checklist-entry-code"
              type="checkbox"
              name="packing_item"
              value="entry-code"
              data-checklist-item
            />
            <span>入場に必要なQRコード・整理番号</span>
          </label>
          <label class="packing_checklist__item" for="checklist-venue-binoculars">
            <input
              id="checklist-venue-binoculars"
              type="checkbox"
              name="packing_item"
              value="venue-binoculars"
              data-checklist-item
            />
            <span>双眼鏡</span>
          </label>
          <label class="packing_checklist__item" for="checklist-rain-gear">
            <input
              id="checklist-rain-gear"
              type="checkbox"
              name="packing_item"
              value="rain-gear"
              data-checklist-item
            />
            <span>雨具</span>
          </label>
          <label class="packing_checklist__item" for="checklist-warm-clothes">
            <input
              id="checklist-warm-clothes"
              type="checkbox"
              name="packing_item"
              value="warm-clothes"
              data-checklist-item
            />
            <span>防寒具</span>
          </label>
          <label class="packing_checklist__item" for="checklist-eco-bag">
            <input
              id="checklist-eco-bag"
              type="checkbox"
              name="packing_item"
              value="eco-bag"
              data-checklist-item
            />
            <span>エコバッグ</span>
          </label>
          <label class="packing_checklist__item" for="checklist-goods-cash">
            <input
              id="checklist-goods-cash"
              type="checkbox"
              name="packing_item"
              value="goods-cash"
              data-checklist-item
            />
            <span>グッズ購入用の現金</span>
          </label>
        </div>
      </section>

      ${bottomNav}
    </main>
  
`,
  },

  contact: {
    page: "contact.html",
    title: "お問い合わせ | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "theme_init.js", "module:contact.js"],
    markup: `
    <main class="app_shell contact_page">
      ${accountHeader}

      <section class="contact" aria-labelledby="contact-title">
        <h1 id="contact-title">お問い合わせ</h1>
        <p class="contact__intro">
          ご質問やご相談は、以下のフォームからお問い合わせください。返信はログイン中のアカウントのお知らせに届きます。
        </p>
        <p data-contact-login hidden><a href="login.html">ログインしてお問い合わせする</a></p>
        <form class="contact__form" data-contact-form>
          <label>
            お問い合わせの種類
            <select name="type" required>
              <option value="">選択してください</option>
              <option>商品について</option>
              <option>レンタルについて</option>
              <option>配送・返却について</option>
              <option>アカウントについて</option>
              <option>その他</option>
            </select>
          </label>
          <label>
            お問い合わせ内容
            <textarea name="message" maxlength="5000" required></textarea>
          </label>
          <button type="submit">送信する</button>
          <p class="contact__status" data-contact-status role="status" aria-live="polite"></p>
        </form>
        <section class="contact__history" aria-labelledby="contact-history-title">
          <h2 id="contact-history-title">送信したお問い合わせ</h2>
          <div data-contact-history></div>
          <p data-contact-history-status role="status"></p>
        </section>
      </section>

      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  waitlist: {
    page: "waitlist.html",
    title: "空き待ちリスト | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: [
      "user_storage.js",
      "theme_init.js",
      "product_data.js",
      "module:waitlist_bootstrap.js",
    ],
    markup: `
    <main class="app_shell waitlist_page" data-waitlist-page>
      ${accountHeader}

      <section class="waitlist_page__content" aria-labelledby="waitlist-title">
        <h1 id="waitlist-title">空き待ちリスト</h1>
        <p class="waitlist_page__description">希望するレンタル期間の空きを待っている商品です。</p>
        <p class="waitlist_page__status" data-waitlist-status role="status">
          空き待ちを読み込んでいます。
        </p>
        <div class="waitlist_list" data-waitlist-list></div>
        <div class="waitlist_page__empty" data-waitlist-empty hidden>
          <p>空き待ちに登録した商品はありません</p>
          <a href="home.html">商品を探す</a>
        </div>
      </section>

      ${appFooter}

      ${bottomNav}
    </main>
  
`,
  },
};
