// 複数の画面で使用するヘッダー、ナビゲーション、フッター。

// about, privacy_policy, usage_guide
export const guideHeader = `<header class="app_header">
        <div class="app_header__start">
          <a class="app_header__icon" href="account.html?view=color" aria-label="設定" data-nav-icon
            data-pages="color_change.html,password_setting.html,credit_card.html">
            <img src="assets/images/setting-icon--outline.png" data-outline="assets/images/setting-icon--outline.png"
              data-filled="assets/images/setting-icon--filled.png" alt="" />
          </a>
          <a class="app_header__icon" href="countdown.html" aria-label="カウントダウン" data-nav-icon
            data-pages="countdown.html">
            <img src="assets/images/timer-icon--outline.svg" data-outline="assets/images/timer-icon--outline.svg"
              data-filled="assets/images/timer-icon--filled.svg" alt="" />
          </a>
        </div>
        <img class="app_header__logo" src="assets/images/logo.png" alt="おしりーす" />
        <div class="app_header__actions">
          <a href="notice.html" aria-label="通知" data-nav-icon data-pages="notice.html">
            <img src="assets/images/notice-icon--outline.png" data-outline="assets/images/notice-icon--outline.png"
              data-filled="assets/images/notice-icon--filled.png" alt="" />
          </a>
          <a href="cart.html" aria-label="カート" data-nav-icon data-pages="cart.html">
            <img src="assets/images/cart-icon--outline.png" data-outline="assets/images/cart-icon--outline.png"
              data-filled="assets/images/cart-icon--filled.png" alt="" />
          </a>
        </div>
      </header>`;

// about, artist_search, binocular_filter, cancellation_refund, checkout_profile, color_change, contact, credit_card, faq, favorites, goods_search, help, member_info, order_complete, order_confirm, password_setting, privacy_policy, recently_viewed, rental_extension, terms, usage_guide, waitlist
export const appFooter = `<footer class="app_footer">
        <nav aria-label="フッターナビゲーション">
          <a href="guide.html?view=about">お店について</a>
          <a href="guide.html?view=usage">使い方ガイド</a>
          <a href="guide.html?view=terms">利用規約</a>
          <a href="guide.html?view=privacy">個人情報保護方針</a>
        </nav>
        <small>Tokimekilab&copy;2026</small>
      </footer>`;

// about, artist_search, binocular_filter, cancellation_refund, checkout_profile, color_change, contact, countdown, countdown_add, countdown_detail, countdown_list, credit_card, faq, favorites, goods_search, help, member_info, order_complete, order_confirm, packing_checklist, password_setting, privacy_policy, recently_viewed, rental_extension, rental_history, terms, usage_guide, waitlist
export const bottomNav = `<nav class="bottom_nav" aria-label="下部ナビゲーション">
        <a
          href="home.html"
          data-nav-icon
          data-pages="home.html,artist_search.html,goods_search.html"
        >
          <img
            src="assets/images/home-icon--outline.png"
            data-outline="assets/images/home-icon--outline.png"
            data-filled="assets/images/home-icon--filled.png"
            alt=""
          />
          ホーム
        </a>
        <a href="account.html?view=favorites" data-favorite-nav>
          <span class="bottom_nav__favorite_icon" aria-hidden="true">♥</span>
          <span class="bottom_nav__badge" data-favorite-count>0</span>
          お気に入り
        </a>
        <a href="mypage.html" data-nav-icon data-pages="mypage.html">
          <img
            src="assets/images/mypage-icon--outline.png"
            data-outline="assets/images/mypage-icon--outline.png"
            data-filled="assets/images/mypage-icon--filled.png"
            alt=""
          />
          マイページ
        </a>
      </nav>`;

// artist_search, binocular_filter, countdown_add, goods_search
export const browseHeader = `<header class="app_header">
        <button
          class="app_header__icon app_header__back"
          type="button"
          aria-label="前の画面へ戻る"
          data-history-back
        >
          <img src="assets/images/back.png" alt="" />
        </button>
        <img class="app_header__logo" src="assets/images/logo.png" alt="おしりーす" />
        <div class="app_header__actions">
          <a href="#" aria-label="通知" data-nav-icon data-pages="notice.html">
            <img
              src="assets/images/notice-icon--outline.png"
              data-outline="assets/images/notice-icon--outline.png"
              data-filled="assets/images/notice-icon--filled.png"
              alt=""
            />
          </a>
          <a href="cart.html" aria-label="カート" data-nav-icon data-pages="cart.html">
            <img
              src="assets/images/cart-icon--outline.png"
              data-outline="assets/images/cart-icon--outline.png"
              data-filled="assets/images/cart-icon--filled.png"
              alt=""
            />
          </a>
        </div>
      </header>`;

// cancellation_refund, color_change, contact, credit_card, faq, favorites, help, member_info, packing_checklist, password_setting, recently_viewed, rental_history, waitlist
export const accountHeader = `<header class="app_header">
        <a
          class="app_header__icon app_header__back"
          href="mypage.html"
          aria-label="マイページへ戻る"
        >
          <img src="assets/images/back.png" alt="" />
        </a>
        <img class="app_header__logo" src="assets/images/logo.png" alt="おしりーす" />
        <div class="app_header__actions">
          <a href="notice.html" aria-label="通知" data-nav-icon data-pages="notice.html">
            <img
              src="assets/images/notice-icon--outline.png"
              data-outline="assets/images/notice-icon--outline.png"
              data-filled="assets/images/notice-icon--filled.png"
              alt=""
            />
          </a>
          <a href="cart.html" aria-label="カート" data-nav-icon data-pages="cart.html">
            <img
              src="assets/images/cart-icon--outline.png"
              data-outline="assets/images/cart-icon--outline.png"
              data-filled="assets/images/cart-icon--filled.png"
              alt=""
            />
          </a>
        </div>
      </header>`;

// checkout_profile, countdown_detail, countdown_list
export const settingsHeader = `<header class="app_header">
        <a
          class="app_header__icon"
          href="account.html?view=color"
          aria-label="設定"
          data-nav-icon
          data-pages="color_change.html,password_setting.html,credit_card.html"
        >
          <img
            src="assets/images/setting-icon--outline.png"
            data-outline="assets/images/setting-icon--outline.png"
            data-filled="assets/images/setting-icon--filled.png"
            alt=""
          />
        </a>
        <img class="app_header__logo" src="assets/images/logo.png" alt="おしりーす" />
        <div class="app_header__actions">
          <a href="notice.html" aria-label="通知" data-nav-icon data-pages="notice.html">
            <img
              src="assets/images/notice-icon--outline.png"
              data-outline="assets/images/notice-icon--outline.png"
              data-filled="assets/images/notice-icon--filled.png"
              alt=""
            />
          </a>
          <a href="cart.html" aria-label="カート" data-nav-icon data-pages="cart.html">
            <img
              src="assets/images/cart-icon--outline.png"
              data-outline="assets/images/cart-icon--outline.png"
              data-filled="assets/images/cart-icon--filled.png"
              alt=""
            />
          </a>
        </div>
      </header>`;

// countdown, terms
export const timerHeader = `<header class="app_header">
        <div class="app_header__start">
          <a
            class="app_header__icon"
            href="account.html?view=color"
            aria-label="設定"
            data-nav-icon
            data-pages="color_change.html,password_setting.html,credit_card.html"
          >
            <img
              src="assets/images/setting-icon--outline.png"
              data-outline="assets/images/setting-icon--outline.png"
              data-filled="assets/images/setting-icon--filled.png"
              alt=""
            />
          </a>
          <a
            class="app_header__icon"
            href="countdown.html"
            aria-label="カウントダウン"
            data-nav-icon
            data-pages="countdown.html"
          >
            <img
              src="assets/images/timer-icon--outline.svg"
              data-outline="assets/images/timer-icon--outline.svg"
              data-filled="assets/images/timer-icon--filled.svg"
              alt=""
            />
          </a>
        </div>
        <img class="app_header__logo" src="assets/images/logo.png" alt="おしりーす" />
        <div class="app_header__actions">
          <a href="notice.html" aria-label="通知" data-nav-icon data-pages="notice.html">
            <img
              src="assets/images/notice-icon--outline.png"
              data-outline="assets/images/notice-icon--outline.png"
              data-filled="assets/images/notice-icon--filled.png"
              alt=""
            />
          </a>
          <a href="cart.html" aria-label="カート" data-nav-icon data-pages="cart.html">
            <img
              src="assets/images/cart-icon--outline.png"
              data-outline="assets/images/cart-icon--outline.png"
              data-filled="assets/images/cart-icon--filled.png"
              alt=""
            />
          </a>
        </div>
      </header>`;

// password_reset, register_complete
export const authLogoHeader = `<header class="auth_header"><img src="assets/images/logo.png" alt="おしりーす" /></header>`;

// register, register_confirm
export const registrationHeader = `<header class="auth_header">
        <a href="login.html"><img src="assets/images/logo.png" alt="おしりーす" /></a>
      </header>`;
