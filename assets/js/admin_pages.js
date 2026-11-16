const adminHeader = (title, active) => `<header class="admin_header">
      <div>
        <img class="admin_header__logo" src="assets/images/logo.png" alt="おしりーす" />
        <h1>${title}</h1>
      </div>
      <div class="admin_header__actions">
        <a href="home.html">利用者画面</a>
        <button type="button" data-admin-logout>ログアウト</button>
      </div>
    </header>

  <nav class="admin_nav" aria-label="管理メニュー">
    <a href="admin.html?view=dashboard"${active === "admin.html?view=dashboard" ? ' aria-current="page"' : ""}>管理トップ</a>
    <a href="admin.html"${active === "admin.html" ? ' aria-current="page"' : ""}>商品管理</a>
    <a href="admin.html?view=orders"${active === "admin.html?view=orders" ? ' aria-current="page"' : ""}>レンタル申込管理</a>
    <a href="admin.html?view=waitlist"${active === "admin.html?view=waitlist" ? ' aria-current="page"' : ""}>空き待ち管理</a>
    <a href="admin.html?view=contacts"${active === "admin.html?view=contacts" ? ' aria-current="page"' : ""}>お問い合わせ管理</a>
  </nav>`;

export const defaultView = "products";

export const pages = {
  products: {
    page: "admin.html",
    title: "商品管理 | おしりーす",
    bodyAttributes: { class: "admin_page is_auth_pending" },
    scripts: [
      "user_storage.js",
      "module:admin_auth_guard.js",
      "product_data.js",
      "module:admin.js",
    ],
    markup: `
    ${adminHeader("商品管理", "admin.html")}

    <main class="admin_main">
      <section class="admin_products" aria-labelledby="admin-products-title">
        <div class="admin_products__heading">
          <div>
            <h2 id="admin-products-title">商品一覧</h2>
            <p>価格、公開状態、在庫状態を変更できます。</p>
          </div>
          <input
            type="search"
            placeholder="商品名で検索"
            aria-label="商品名で検索"
            data-admin-search
          />
        </div>
        <div class="admin_products__table" data-admin-products></div>
        <p class="admin_empty" data-admin-empty hidden>
          商品データがありません。product_data.jsを読み込むと表示されます。
        </p>
      </section>

      <section class="admin_daily" aria-labelledby="admin-daily-title">
        <div class="admin_daily__heading">
          <div>
            <h2 id="admin-daily-title">日付別の在庫</h2>
            <p>確認したい日を選ぶと、その日に貸し出せる在庫が表示されます。</p>
          </div>
          <label>
            確認日
            <input type="date" data-admin-inventory-date />
          </label>
        </div>
        <div class="admin_daily__list" data-admin-daily-inventory></div>
      </section>

      <section class="admin_summary" aria-label="商品状況">
        <div>
          <span>登録商品</span>
          <strong data-admin-total>0</strong>
        </div>
        <div>
          <span>公開中</span>
          <strong data-admin-public>0</strong>
        </div>
        <div>
          <span>貸出可能</span>
          <strong data-admin-available>0</strong>
        </div>
      </section>

      <section class="admin_editor" data-admin-editor hidden aria-labelledby="admin-editor-title">
        <form data-admin-form>
          <div class="admin_editor__heading">
            <h2 id="admin-editor-title">商品を編集</h2>
            <button type="button" aria-label="編集を閉じる" data-admin-close>×</button>
          </div>
          <input type="hidden" name="id" />
          <label>
            商品名
            <input name="name" required />
          </label>
          <label>
            基本料金
            <span class="admin_editor__price">
              <input name="price" type="number" min="0" required />
              円
            </span>
          </label>
          <label>
            公開状態
            <select name="isPublic">
              <option value="true">公開</option>
              <option value="false">非公開</option>
            </select>
          </label>
          <label>
            在庫状態
            <select name="stockStatus">
              <option value="available">貸出可能</option>
              <option value="unavailable">貸出不可</option>
            </select>
          </label>
          <section class="admin_inventory" aria-labelledby="admin-inventory-title">
            <div class="admin_inventory__heading">
              <div>
                <h3 id="admin-inventory-title">種類別の在庫</h3>
                <p>カラー・文字・倍率などの在庫数を設定します。</p>
              </div>
              <strong data-admin-inventory-total>0点</strong>
            </div>
            <div class="admin_inventory__groups" data-admin-variants></div>
            <div class="admin_inventory__bulk">
              <label>
                全種類への追加数
                <input type="number" min="1" value="1" data-admin-bulk-amount />
              </label>
              <button type="button" data-admin-bulk-add>全種類の在庫を一括で増やす</button>
            </div>
          </section>
          <div class="admin_editor__actions">
            <button type="button" data-admin-reset>初期値に戻す</button>
            <button type="submit">変更を保存</button>
          </div>
          <p data-admin-status role="status"></p>
        </form>
      </section>
    </main>
  
`,
  },

  dashboard: {
    page: "admin_dashboard.html",
    title: "管理トップ | おしりーす",
    bodyAttributes: { class: "admin_page is_auth_pending" },
    scripts: [
      "user_storage.js",
      "product_data.js",
      "module:admin_auth_guard.js",
      "module:admin_dashboard.js",
    ],
    markup: `
    ${adminHeader("管理トップ", "admin.html?view=dashboard")}
    <main class="admin_main">
      <p data-dashboard-status role="status">データを読み込んでいます。</p>
      <div class="admin_dashboard_actions">
        <button type="button" data-dashboard-migrate disabled>既存注文の在庫を反映</button>
      </div>
      <section class="admin_summary admin_dashboard_summary" aria-label="レンタル状況">
        <div>
          <span>申込総数</span>
          <strong data-dashboard-count="all">0</strong>
        </div>
        <div>
          <a href="admin.html?view=orders&status=配送待ち">配送待ち</a>
          <strong data-dashboard-count="配送待ち">0</strong>
        </div>
        <div>
          <a href="admin.html?view=orders&status=配送中">配送中</a>
          <strong data-dashboard-count="配送中">0</strong>
        </div>
        <div>
          <a href="admin.html?view=orders&status=返品待ち">返却待ち</a>
          <strong data-dashboard-count="返品待ち">0</strong>
        </div>
        <div>
          <a href="admin.html?view=orders&status=キャンセル">キャンセル</a>
          <strong data-dashboard-count="キャンセル">0</strong>
        </div>
        <div>
          <span>公開商品</span>
          <strong data-dashboard-products>0</strong>
        </div>
      </section>
      <section class="admin_products" aria-labelledby="dashboard-stock-title">
        <div class="admin_products__heading">
          <h2 id="dashboard-stock-title">残り在庫の少ない種類</h2>
          <label>
            確認日
            <input type="date" data-dashboard-date />
          </label>
        </div>
        <div class="admin_dashboard_list" data-dashboard-stock></div>
        <p class="admin_empty" data-dashboard-stock-empty hidden>残り1点以下の商品はありません。</p>
      </section>
      <section class="admin_products" aria-labelledby="dashboard-order-title">
        <div class="admin_products__heading">
          <h2 id="dashboard-order-title">最近の申込み</h2>
          <a href="admin.html?view=orders">すべての申込みを見る</a>
        </div>
        <div class="admin_dashboard_list" data-dashboard-orders></div>
        <p class="admin_empty" data-dashboard-orders-empty hidden>申込みはまだありません。</p>
      </section>
    </main>
  
`,
  },

  orders: {
    page: "admin_orders.html",
    title: "レンタル申込管理 | おしりーす",
    bodyAttributes: { class: "admin_page is_auth_pending" },
    scripts: [
      "user_storage.js",
      "module:admin_auth_guard.js",
      "product_data.js",
      "module:admin_orders.js",
    ],
    markup: `
    ${adminHeader("レンタル申込管理", "admin.html?view=orders")}

    <main class="admin_main">
      <section class="admin_summary" aria-label="申込状況">
        <div>
          <span>申込件数</span>
          <strong data-order-total>0</strong>
        </div>
        <div>
          <span>配送待ち</span>
          <strong data-order-waiting>0</strong>
        </div>
        <div>
          <span>返却待ち</span>
          <strong data-order-returning>0</strong>
        </div>
      </section>

      <section class="admin_orders" aria-labelledby="admin-orders-title">
        <div class="admin_products__heading">
          <div>
            <h2 id="admin-orders-title">レンタル申込一覧</h2>
            <p>配送に必要な情報とレンタル状況を確認できます。</p>
          </div>
          <input
            type="search"
            placeholder="注文番号・氏名で検索"
            aria-label="注文番号・氏名で検索"
            data-order-search
          />
        </div>
        <p data-admin-orders-status role="status"></p>
        <div class="admin_orders__list" data-admin-orders></div>
        <p class="admin_empty" data-admin-orders-empty hidden>レンタル申込はまだありません。</p>
      </section>
    </main>
  
`,
  },

  waitlist: {
    page: "admin_waitlist.html",
    title: "空き待ち管理 | おしりーす",
    bodyAttributes: { class: "admin_page is_auth_pending" },
    scripts: [
      "user_storage.js",
      "module:admin_auth_guard.js",
      "product_data.js",
      "module:admin_waitlist.js",
    ],
    markup: `
    ${adminHeader("空き待ち管理", "admin.html?view=waitlist")}

    <main class="admin_main">
      <section class="admin_summary" aria-label="空き待ち状況">
        <div>
          <span>登録件数</span>
          <strong data-waitlist-total>0</strong>
        </div>
        <div>
          <span>通知待ち</span>
          <strong data-waitlist-pending>0</strong>
        </div>
        <div>
          <span>通知済み</span>
          <strong data-waitlist-notified>0</strong>
        </div>
      </section>

      <section class="admin_orders" aria-labelledby="admin-waitlist-title">
        <div class="admin_products__heading">
          <div>
            <h2 id="admin-waitlist-title">空き待ち一覧</h2>
            <p>空きが出た商品について、通知希望者への案内状況を管理できます。</p>
          </div>
        </div>
        <div class="admin_dashboard_actions">
          <button type="button" data-admin-notify-all disabled>通知可能な方へまとめて通知</button>
        </div>
        <div class="admin_waitlist__list" data-admin-waitlist></div>
        <p class="admin_empty" data-admin-waitlist-empty hidden>空き待ち登録はありません。</p>
        <p class="admin_waitlist__status" data-admin-waitlist-status role="status"></p>
      </section>
    </main>
  
`,
  },

  contacts: {
    page: "admin_contacts.html",
    title: "お問い合わせ管理 | おしりーす",
    bodyAttributes: { class: "admin_page is_auth_pending" },
    scripts: ["module:admin_auth_guard.js", "module:admin_contacts.js"],
    markup: `
    ${adminHeader("お問い合わせ管理", "admin.html?view=contacts")}
    <main class="admin_main">
      <section class="admin_summary" aria-label="お問い合わせ状況">
        <div>
          <span>受付件数</span>
          <strong data-contacts-total>0</strong>
        </div>
        <div>
          <span>未返信</span>
          <strong data-contacts-pending>0</strong>
        </div>
      </section>
      <section class="admin_products" aria-labelledby="contacts-title">
        <div class="admin_products__heading">
          <h2 id="contacts-title">お問い合わせ一覧</h2>
          <label>
            対応状況
            <select data-contacts-filter>
              <option value="all">すべて</option>
              <option value="pending">未返信</option>
              <option value="replied">返信済み</option>
            </select>
          </label>
        </div>
        <div class="admin_contacts__inner">
          <p data-contacts-status role="status">お問い合わせを読み込んでいます。</p>
          <div data-admin-contacts></div>
          <p class="admin_empty" data-contacts-empty hidden>該当するお問い合わせはありません。</p>
        </div>
      </section>
    </main>
  
`,
  },

  login: {
    page: "admin_login.html",
    title: "管理者ログイン | おしりーす",
    bodyAttributes: { class: "admin_login_page" },
    scripts: ["user_storage.js", "module:admin_login.js"],
    markup: `
    <main class="admin_login">
      <section class="admin_login__panel" aria-labelledby="admin-login-title">
        <p class="admin_login__brand">おしりーす</p>
        <h1 id="admin-login-title">管理者ログイン</h1>
        <p class="admin_login__description">登録済みの管理者アカウントでログインしてください。</p>

        <form class="admin_login__form" data-admin-login-form>
          <label>
            メールアドレス
            <input name="email" type="email" required autocomplete="username" />
          </label>
          <label>
            パスワード
            <input name="password" type="password" required autocomplete="current-password" />
          </label>
          <p class="admin_login__status" data-admin-login-status role="alert"></p>
          <button type="submit">ログイン</button>
        </form>

        <a class="admin_login__back" href="login.html">利用者ログインへ戻る</a>
      </section>
    </main>
  
`,
  },
};
