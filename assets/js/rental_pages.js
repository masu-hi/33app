import { appFooter, accountHeader, settingsHeader, bottomNav } from "./shared_page_markup.js";

export const defaultView = "history";

export const pages = {
  profile: {
    page: "checkout_profile.html",
    title: "会員情報の登録 | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: [
      "user_storage.js",
      "theme_init.js",
      "birthday_fields.js",
      "module:checkout_profile.js",
    ],
    markup: `
    <main class="app_shell member_info_page">
      ${settingsHeader}
      <section class="member_info member_info--checkout" aria-labelledby="checkout-profile-title">
        <h1 id="checkout-profile-title">会員情報</h1>
        <p class="member_info__intro">お届け先と会員情報を登録してください。</p>
        <form class="member_info__form" data-checkout-profile>
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
                maxlength="3"
                pattern="[0-9]{3}"
                placeholder="123"
                aria-label="郵便番号の最初の3桁"
              />
              <span>-</span>
              <input
                name="postal_last"
                required
                inputmode="numeric"
                maxlength="4"
                pattern="[0-9]{4}"
                placeholder="4567"
                aria-label="郵便番号の最後の4桁"
              />
              <button type="button" data-profile-address-search>住所検索</button>
            </div>
            <p class="postal_status" data-profile-postal-status role="status"></p>
          </fieldset>
          <label>
            都道府県
            <select name="prefecture" required>
              <option value="">選択してください</option>
            </select>
          </label>
          <label>
            市区町村・番地
            <input name="address" required autocomplete="street-address" />
          </label>
          <label>
            建物名・部屋番号（任意）
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
              <option>水色</option>
              <option>紫</option>
              <option>オレンジ</option>
              <option>黄色</option>
              <option>緑</option>
              <option>白</option>
              <option>黒</option>
            </select>
          </label>
          <p data-profile-status role="status"></p>
          <div class="member_info__form_actions member_info__form_actions--single">
            <button type="submit" disabled>登録して決済へもどる</button>
          </div>
        </form>
      </section>
      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  confirm: {
    page: "order_confirm.html",
    title: "注文内容の確認 | おしりーす",
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
      商品情報を読み込んでいます
    </div>
    <main class="app_shell order_page" data-order-confirm>
      <header class="mypage_header">
        <a class="mypage_header__back" href="checkout.html" aria-label="決済方法へ戻る">
          <img src="assets/images/back.png" alt="" />
        </a>
        <p class="order_page__header_title">カート</p>
        <div class="mypage_header__actions">
          <a href="#" aria-label="通知">
            <img src="assets/images/notice-icon--outline.png" alt="" />
          </a>
          <a href="cart.html" aria-label="カート">
            <img src="assets/images/cart-icon--outline.png" alt="" />
          </a>
        </div>
      </header>

      <section class="order_confirm">
        <h1>注文内容の確認</h1>
        <p data-order-availability role="status" hidden></p>
        <dl class="order_confirm__details">
          <div>
            <dt>注文番号：</dt>
            <dd data-order-id></dd>
          </div>
          <div>
            <dt>お届け先：</dt>
            <dd data-order-address></dd>
          </div>
          <div>
            <dt>レンタル期間：</dt>
            <dd data-order-period></dd>
          </div>
          <div>
            <dt>受け取り方法：</dt>
            <dd>配送で受け取り</dd>
          </div>
          <div>
            <dt>支払い方法：</dt>
            <dd data-order-payment></dd>
          </div>
        </dl>

        <article class="order_product">
          <img src="assets/images/penlight.png" alt="LEDコンサートライト" />
          <div>
            <h2>
              ペンライト
              <br />
              （シンプルタイプ）
            </h2>
            <p>¥800 / 4日間〜</p>
          </div>
          <span data-order-quantity>1</span>
        </article>

        <dl class="order_totals">
          <div>
            <dt>商品合計</dt>
            <dd data-order-subtotal></dd>
          </div>
          <div>
            <dt>往復送料</dt>
            <dd data-order-shipping>¥440</dd>
          </div>
          <div data-order-fee-row>
            <dt>決済手数料</dt>
            <dd data-order-fee></dd>
          </div>
          <div class="order_totals__grand">
            <dt>合計</dt>
            <dd data-order-total></dd>
          </div>
        </dl>

        <button class="order_page__primary" type="button" data-place-order>注文を確定する</button>
      </section>
      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  complete: {
    page: "order_complete.html",
    title: "注文確定 | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js"],
    markup: `
    <main class="app_shell order_page" data-order-complete>
      <header class="mypage_header">
        <a class="mypage_header__back" href="home.html" aria-label="トップへ戻る">
          <img src="assets/images/back.png" alt="" />
        </a>
        <p class="order_page__header_title">カート</p>
        <div class="mypage_header__actions">
          <a href="#" aria-label="通知">
            <img src="assets/images/notice-icon--outline.png" alt="" />
          </a>
          <a href="cart.html" aria-label="カート">
            <img src="assets/images/cart-icon--outline.png" alt="" />
          </a>
        </div>
      </header>
      <section class="order_complete">
        <h1>注文確定</h1>
        <p class="order_complete__thanks">ご注文ありがとうございました</p>
        <dl class="order_complete__summary">
          <div>
            <dt>注文番号：</dt>
            <dd data-complete-id></dd>
          </div>
          <div>
            <dt>ご注文受付日：</dt>
            <dd data-complete-date></dd>
          </div>
          <div>
            <dt>レンタル期間：</dt>
            <dd data-complete-period></dd>
          </div>
          <div>
            <dt>返却期限：</dt>
            <dd data-complete-return-deadline></dd>
          </div>
          <div>
            <dt>支払い方法：</dt>
            <dd data-complete-payment></dd>
          </div>
          <div>
            <dt>合計金額：</dt>
            <dd data-complete-total></dd>
          </div>
        </dl>
        <div class="order_complete__return">
          <p class="order_complete__return-title">返却方法</p>
          <p class="order_complete__return-text">
            届いた箱に商品を入れ、同封されている着払い伝票を貼ってください。
            <br />
            郵便局またはコンビニから発送してください。
          </p>
          <dl>
            <div class="order_complete__return-deadline">
              <dt>返却期限：</dt>
              <dd data-complete-return-deadline></dd>
            </div>
          </dl>
        </div>
        <p class="order_complete__message">
          レンタルのお申し込みが確定しました。
          <br />
          ご登録のメールアドレスへ、ご注文内容とレンタルに関する確認メールをお送りしました。
          <br />
          メールが届かない場合は、迷惑メールフォルダをご確認いただくか、お問い合わせください。
        </p>
        <a class="order_page__primary" href="home.html">トップに戻る</a>
      </section>
      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  history: {
    page: "rental_history.html",
    title: "レンタル履歴 | おしりーす",
    bodyAttributes: { class: "mobile_app is_product_data_loading", "aria-busy": "true" },
    scripts: [
      "user_storage.js",
      "product_data.js",
      "theme_init.js",
      "module:firebase_app_bootstrap.js",
    ],
    markup: `
    <div class="product_data_loading" data-product-data-loading role="status">
      レンタル情報を読み込んでいます
    </div>
    <main class="app_shell rental_history">
      ${accountHeader}
      <section class="rental_history__content" data-rental-history>
        <h1>レンタル履歴</h1>
        <div class="rental_history__list" data-rental-history-list></div>
        <div class="rental_history__empty" data-rental-history-empty>
          <p>レンタル履歴はまだありません</p>
          <a href="home.html">商品を探す</a>
        </div>
      </section>

      ${bottomNav}
    </main>
  
`,
  },

  extension: {
    page: "rental_extension.html",
    title: "レンタル期間の延長 | おしりーす",
    bodyAttributes: { class: "mobile_app is_product_data_loading", "aria-busy": "true" },
    scripts: [
      "user_storage.js",
      "product_data.js",
      "theme_init.js",
      "module:firebase_app_bootstrap.js",
    ],
    markup: `
    <div class="product_data_loading" data-product-data-loading role="status">
      レンタル情報を読み込んでいます
    </div>
    <main class="app_shell cancellation_refund_page" data-extension-page>
      <header class="app_header">
        <a class="app_header__icon" href="account.html?view=color" aria-label="設定">
          <img src="assets/images/setting-icon--outline.png" alt="" />
        </a>
        <img class="app_header__logo" src="assets/images/logo.png" alt="おしりーす" />
        <div class="app_header__actions">
          <a href="notice.html" aria-label="通知">
            <img src="assets/images/notice-icon--outline.png" alt="" />
          </a>
          <a href="cart.html" aria-label="カート">
            <img src="assets/images/cart-icon--outline.png" alt="" />
          </a>
        </div>
      </header>

      <section class="cancellation_confirm">
        <div data-extension-available>
          <h1>この商品のレンタル期間を延長しますか？</h1>
          <dl>
            <div>
              <dt>注文番号</dt>
              <dd data-extension-order-id></dd>
            </div>
            <div>
              <dt>商品</dt>
              <dd data-extension-product></dd>
            </div>
            <div>
              <dt>現在の期間</dt>
              <dd data-extension-current-period></dd>
            </div>
            <div>
              <dt>延長後</dt>
              <dd data-extension-new-period></dd>
            </div>
            <div>
              <dt>延長料金</dt>
              <dd>1日 440円（税込）</dd>
            </div>
          </dl>
          <p>※決済方法はクレジットカードとPayPayのみです。</p>
          <div class="cancellation_confirm__actions">
            <a href="rental.html?view=history">戻る</a>
            <a data-extension-payment>決済方法を選ぶ</a>
          </div>
        </div>
        <div class="cancellation_confirm__complete" data-extension-unavailable hidden>
          <h1>こちらの商品は延長できません</h1>
          <p>次の日に別の予約が入っているため、レンタル期間を延長できません。</p>
          <a href="rental.html?view=history">レンタル履歴に戻る</a>
        </div>
      </section>

      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  cancel: {
    page: "cancellation_refund.html",
    title: "キャンセル・払い戻し | おしりーす",
    bodyAttributes: { class: "mobile_app is_product_data_loading", "aria-busy": "true" },
    scripts: [
      "user_storage.js",
      "product_data.js",
      "theme_init.js",
      "module:firebase_app_bootstrap.js",
    ],
    markup: `
    <div class="product_data_loading" data-product-data-loading role="status">
      レンタル情報を読み込んでいます
    </div>
    <main class="app_shell cancellation_refund_page">
      ${accountHeader}

      <section class="cancellation_confirm" data-cancellation-confirm hidden>
        <div data-cancellation-prompt>
          <h1>この商品をキャンセルしますか？</h1>
          <dl>
            <div>
              <dt>注文番号</dt>
              <dd data-cancellation-order-id></dd>
            </div>
            <div>
              <dt>商品</dt>
              <dd data-cancellation-product></dd>
            </div>
            <div>
              <dt>レンタル期間</dt>
              <dd data-cancellation-period></dd>
            </div>
          </dl>
          <p>キャンセル規定に基づき、時期によってキャンセル料が発生する場合があります。</p>
          <div class="cancellation_confirm__actions">
            <a href="rental.html?view=history">戻る</a>
            <button type="button" data-confirm-cancellation>キャンセルする</button>
          </div>
        </div>
        <div class="cancellation_confirm__complete" data-cancellation-complete hidden>
          <h1>キャンセルが完了しました。</h1>
          <p>レンタル履歴と在庫へ反映しました。</p>
          <a href="rental.html?view=history">レンタル履歴に戻る</a>
        </div>
      </section>

      <section
        class="cancellation_refund"
        aria-labelledby="cancellation-refund-title"
        data-cancellation-guide
      >
        <h1 id="cancellation-refund-title">キャンセル・払い戻し</h1>
        <p class="cancellation_refund__intro">キャンセル・払い戻しに関する情報を確認できます。</p>
        <section class="cancellation_refund__card">
          <h2>キャンセルについて</h2>
          <p>レンタル履歴から、対象のレンタルを選んでキャンセル手続きができます。</p>
          <a href="rental.html?view=history">
            レンタル履歴を確認する
            <span aria-hidden="true">›</span>
          </a>
        </section>
        <section class="cancellation_refund__card">
          <h2>払い戻しについて</h2>
          <p>キャンセル内容を確認後、条件に応じてご登録のお支払い方法へ払い戻しを行います。</p>
          <a href="guide.html?view=usage#cancellation-refund">
            キャンセル規定を確認する
            <span aria-hidden="true">›</span>
          </a>
        </section>
      </section>

      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },
};
