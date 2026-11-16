import { browseHeader, settingsHeader, timerHeader, bottomNav } from "./shared_page_markup.js";

export const defaultView = "main";

export const pages = {
  main: {
    page: "countdown.html",
    title: "ライブカウントダウン | おしりーす",
    bodyAttributes: { class: "mobile_app countdown_page is_product_data_loading" },
    scripts: ["user_storage.js", "theme_init.js", "module:countdown_bootstrap.js"],
    markup: `
    <div class="product_data_loading" data-countdown-loading role="status">
      予定を読み込んでいます。
    </div>
    <main class="app_shell">
      ${timerHeader}

      <div class="countdown_container">
        <div class="countdown_hearts" aria-hidden="true">
          <span class="countdown_hearts__item countdown_hearts__item--1">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--2">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--3">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--4">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--5">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--6">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--7">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--8">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--9">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--10">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--11">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--12">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--13">♡</span>
          <span class="countdown_hearts__item countdown_hearts__item--14">♡</span>
        </div>

        <div class="countdown_toolbar">
          <a class="countdown_toolbar__list_link" href="countdown.html?view=list">イベント一覧</a>
          <a
            href="countdown.html?view=add"
            class="countdown_toolbar__edit_button"
            aria-label="イベントを追加する"
          >
            <img src="assets/images/calendar_edit_icon.svg" alt="" width="24" height="24" />
          </a>
        </div>

        <div class="countdown_circle" role="timer" aria-live="polite">
          <div class="countdown_circle__inner">
            <p class="countdown_circle__label" id="circleLabel">ライブまで</p>
            <div class="countdown_circle__days_wrap">
              <span class="countdown_circle__days_num" id="countdownDays">12</span>
              <span class="countdown_circle__days_unit" id="countdownDaysUnit">日</span>
            </div>
            <p class="countdown_circle__date" id="circleDate">2026.12.24</p>
          </div>
        </div>

        <div class="countdown_message">
          <div class="countdown_message__body">
            <p class="countdown_message__heading" id="countdownMessage">当日はなに着ていく？ ♡</p>
            <div class="countdown_message__divider" aria-hidden="true">
              <span class="countdown_message__line"></span>
              <span class="countdown_message__heart">♡</span>
              <span class="countdown_message__line"></span>
            </div>
          </div>
        </div>

        <a href="countdown.html?view=detail" class="countdown_card" aria-label="ライブ詳細を見る">
          <div class="countdown_card__badge">
            <span class="countdown_card__badge_date" id="cardBadgeDate">12/24</span>
            <span class="countdown_card__badge_weekday" id="cardBadgeWeekday">(土)</span>
          </div>
          <div class="countdown_card__info">
            <h2 class="countdown_card__title" id="cardEventTitle">Sugar ♡ Tune LIVE TOUR</h2>
            <p class="countdown_card__place">
              <img src="assets/images/map_pin_icon.svg" alt="" class="countdown_card__place_icon" />
              <span id="cardEventPlace">名古屋◯◯ホール</span>
            </p>
          </div>
        </a>
        <button type="button" id="editEventBtn" class="countdown_edit_link">
          この予定を編集する
        </button>
      </div>

      <dialog class="countdown_modal" id="eventModal">
        <div class="countdown_modal__card">
          <h3 class="countdown_modal__title">ライブ予定を設定</h3>
          <form id="eventForm" class="countdown_modal__form">
            <label class="countdown_modal__field">
              <span>イベント名</span>
              <input
                type="text"
                id="inputTitle"
                name="title"
                required
                value="Sugar ♡ Tune LIVE TOUR"
              />
            </label>
            <label class="countdown_modal__field">
              <span>公演日</span>
              <input type="date" id="inputDate" name="date" required value="2026-12-24" />
            </label>
            <label class="countdown_modal__field">
              <span>会場・場所</span>
              <input type="text" id="inputPlace" name="place" required value="名古屋◯◯ホール" />
            </label>
            <div class="countdown_modal__actions">
              <button type="button" class="button button--outline" id="closeModalBtn">
                キャンセル
              </button>
              <button type="submit" class="button">保存する</button>
            </div>
          </form>
        </div>
      </dialog>

      ${bottomNav}
    </main>
  
`,
  },

  add: {
    page: "countdown_add.html",
    title: "イベントを追加 | おしりーす",
    bodyAttributes: { class: "mobile_app countdown_add_page is_product_data_loading" },
    scripts: ["user_storage.js", "theme_init.js", "module:countdown_bootstrap.js"],
    markup: `
    <div class="product_data_loading" data-countdown-loading role="status">予定を読み込んでいます。</div>
    <main class="app_shell">
      ${browseHeader}

      <section class="countdown_add" aria-labelledby="countdownAddTitle">
        <div class="countdown_add__heading">
          <h1 class="countdown_add__title" id="countdownAddTitle">イベントを追加</h1>
        </div>
        <form class="countdown_add__form" id="countdownAddForm">
          <label class="countdown_add__field">
            <span>イベント名</span>
            <input type="text" name="title" id="eventTitle" required />
          </label>

          <div class="countdown_add__calendar" aria-label="ライブ日を選択">
            <div class="countdown_add__calendar_header">
              <button type="button" id="previousMonth" aria-label="前の月">‹</button>
              <h2 id="calendarMonth" aria-live="polite"></h2>
              <button type="button" id="nextMonth" aria-label="次の月">›</button>
            </div>
            <div class="countdown_add__weekdays" aria-hidden="true">
              <span>日</span>
              <span>月</span>
              <span>火</span>
              <span>水</span>
              <span>木</span>
              <span>金</span>
              <span>土</span>
            </div>
            <div class="countdown_add__days" id="calendarDays" aria-label="日付"></div>
          </div>
          <input
            class="countdown_add__date_input"
            type="date"
            name="date"
            id="eventDate"
            required
            aria-label="選択中のイベント日"
          />
          <p class="countdown_add__date_display">
            <span>日付</span>
            <time id="eventDateLabel" datetime="2026-12-24">2026.12.24</time>
          </p>

          <label class="countdown_add__field">
            <span>場所</span>
            <input type="text" name="place" id="eventPlace" required />
          </label>

          <label class="countdown_add__field countdown_add__field--memo">
            <span>メモ</span>
            <textarea name="memo" id="eventMemo" rows="4"></textarea>
          </label>

          <p class="countdown_add__error" id="formError" role="alert" hidden>
            イベント名・日付・場所を入力してください。
          </p>
        </form>
      </section>

      ${bottomNav}

      <button class="countdown_add__submit" type="submit" form="countdownAddForm">登録する</button>
    </main>
  
`,
  },

  list: {
    page: "countdown_list.html",
    title: "イベント一覧 | おしりーす",
    bodyAttributes: { class: "mobile_app countdown_list_page is_product_data_loading" },
    scripts: ["user_storage.js", "theme_init.js", "module:countdown_bootstrap.js"],
    markup: `
    <div class="product_data_loading" data-countdown-loading role="status">予定を読み込んでいます。</div>
    <main class="app_shell">
      ${settingsHeader}

      <section class="countdown_list" aria-labelledby="countdownListTitle">
        <h1 class="countdown_list__title" id="countdownListTitle">イベント一覧</h1>
        <div class="countdown_list__items" id="eventList" aria-live="polite"></div>
      </section>

      ${bottomNav}
    </main>
  
`,
  },

  detail: {
    page: "countdown_detail.html",
    title: "ライブ詳細 | おしりーす",
    bodyAttributes: { class: "mobile_app countdown_detail_page is_product_data_loading" },
    scripts: ["user_storage.js", "theme_init.js", "module:countdown_bootstrap.js"],
    markup: `
    <div class="product_data_loading" data-countdown-loading role="status">予定を読み込んでいます。</div>
    <main class="app_shell">
      ${settingsHeader}

      <div class="countdown_detail_container">
        <div class="countdown_detail_nav">
          <a
            href="countdown.html"
            class="countdown_detail_nav__back"
            aria-label="カウントダウン画面に戻る"
          >
            <svg
              class="countdown_detail_nav__arrow"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>戻る</span>
          </a>
          <div class="countdown_detail_nav__hearts" aria-hidden="true">
            <span class="countdown_detail_nav__heart countdown_detail_nav__heart--1">♡</span>
            <span class="countdown_detail_nav__heart countdown_detail_nav__heart--2">♡</span>
            <span class="countdown_detail_nav__heart countdown_detail_nav__heart--3">♡</span>
          </div>
        </div>

        <div class="countdown_detail_title_card">
          <p class="countdown_detail_title_card__artist" id="detailArtist">Sugar ♡ Tune</p>
          <p class="countdown_detail_title_card__tour" id="detailTour">LIVE TOUR 2026</p>
        </div>

        <div class="countdown_detail_info_list">
          <div class="countdown_detail_info_item">
            <img
              src="assets/images/calendar_icon.svg"
              alt=""
              class="countdown_detail_info_item__icon"
            />
            <span class="countdown_detail_info_item__text" id="detailDate">2026.12.24(土)</span>
          </div>
          <div class="countdown_detail_info_item">
            <img
              src="assets/images/map_pin_icon.svg"
              alt=""
              class="countdown_detail_info_item__icon"
            />
            <span class="countdown_detail_info_item__text" id="detailPlace">名古屋◯◯ホール</span>
          </div>
        </div>

        <div class="countdown_detail_counter">
          <div class="countdown_detail_counter__wrap">
            <div class="countdown_detail_counter__text">
              <span class="countdown_detail_counter__prefix">あと</span>
              <strong class="countdown_detail_counter__days" id="detailDays">12</strong>
              <span class="countdown_detail_counter__suffix">日</span>
            </div>
            <div class="countdown_detail_counter__hearts" aria-hidden="true">
              <span class="countdown_detail_counter__heart countdown_detail_counter__heart--1">
                ♡
              </span>
              <span class="countdown_detail_counter__heart countdown_detail_counter__heart--2">
                ♡
              </span>
            </div>
          </div>
          <div class="countdown_detail_counter__divider" aria-hidden="true">
            <span class="countdown_detail_counter__line"></span>
            <span class="countdown_detail_counter__center_heart">♡</span>
            <span class="countdown_detail_counter__line"></span>
          </div>
        </div>

        <section class="countdown_detail_memo" aria-label="ライブメモ">
          <h2 class="countdown_detail_memo__title">ライブメモ</h2>
          <textarea
            class="countdown_detail_memo__textarea"
            id="memoTextarea"
            placeholder="持ち物や座席番号、曲の予習など自由にメモしてね ♡"
            aria-label="ライブメモ入力欄"
          ></textarea>
          <button class="countdown_memo_save" id="saveMemoButton" type="button">メモを保存</button>
        </section>
      </div>

      ${bottomNav}
    </main>
  
`,
  },
};
