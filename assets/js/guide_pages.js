import {
  appFooter,
  guideHeader,
  accountHeader,
  timerHeader,
  bottomNav,
} from "./shared_page_markup.js";

export const defaultView = "usage";

export const pages = {
  about: {
    page: "about.html",
    title: "おしりーすについて",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js"],
    markup: `
    <main class="app_shell about_page">
      ${guideHeader}
      <div class="about_content">
        <section class="about_intro">
          <h1 class="about_intro__title">こんな悩み、ありませんか？</h1>

          <div class="about_problem about_problem--right">
            <div class="about_problem__bubble">
              友達に誘われて、初めて行くグループのライブ。
              <br />
              楽しみだけど、ペンライトを持ってないんだよね
              <br />
              「ライブのためだけに買うのはなぁ……」
            </div>
            <img src="assets/images/about-01.png" alt="" class="about_problem__image" />
          </div>

          <!-- 悩み02 -->
          <div class="about_problem about_problem--left">
            <img src="assets/images/about-02.png" alt="" class="about_problem__image" />
            <div class="about_problem__bubble">
              推し活グッズを買ってみたものの、、
              <br />
              家に置いておくスペースがないなぁ、、、
            </div>
          </div>

          <!-- 悩み03 -->
          <div class="about_problem about_problem--right">
            <div class="about_problem__bubble">
              初めてのライブたのしみだけど、、、
              <br />
              何を準備したらいいの！！
            </div>
            <img src="assets/images/about-03.png" alt="" class="about_problem__image" />
          </div>
        </section>

        <!-- --------------------------------
          02 : ライブって
        --------------------------------- -->
        <section class="about_feeling">
          <!-- 飾りハート -->
          <span class="about_feeling__decor about_feeling__decor--heart-pink-1" aria-hidden="true">
            ♥
          </span>
          <span class="about_feeling__decor about_feeling__decor--heart-blue-1" aria-hidden="true">
            ♥
          </span>
          <span class="about_feeling__decor about_feeling__decor--heart-pink-2" aria-hidden="true">
            ♥
          </span>
          <span class="about_feeling__decor about_feeling__decor--heart-blue-2" aria-hidden="true">
            ♥
          </span>

          <!-- 中央の円 -->
          <div class="about_feeling__circle">
            <p>
              ライブって、
              <br />
              <br />
              楽しみな気持ちと一緒に、
              <br />
              <br />
              ちょっとした
              <br />
              <br />
              不安もありますよね。
            </p>
          </div>

          <!-- 円右下のハート -->
          <span class="about_feeling__decor about_feeling__decor--heart-pink-3" aria-hidden="true">
            ♥
          </span>
          <span class="about_feeling__decor about_feeling__decor--heart-blue-3" aria-hidden="true">
            ♥
          </span>
          <span class="about_feeling__decor about_feeling__decor--heart-blue-4" aria-hidden="true">
            ♥
          </span>
          <span class="about_feeling__decor about_feeling__decor--heart-pink-4" aria-hidden="true">
            ♥
          </span>
        </section>

        <!-- --------------------------------
          03 : 解決策・思い
        --------------------------------- -->
        <section class="about_solution">
          <div class="about_solution__top">
            <img src="assets/images/about-04.png" alt="" class="about_solution__image" />

            <div class="about_solution__bubble">
              必要なものを必要なときだけ借りられたら、
              <br />
              もっと気軽にライブを楽しめるんじゃないか！！
            </div>
          </div>

          <p class="about_solution__text">
            そんな思いから、
            <br />
            このレンタルサービスをはじめました!!
          </p>
        </section>

        <section class="about_oshi">
          <h2 class="about_oshi__title">いつもの推し活も、</h2>

          <div class="about_oshi__main_image_wrap">
            <img
              src="assets/images/about-05.png"
              alt="ライブで盛り上がる人々"
              class="about_oshi__main_image"
            />
          </div>

          <div class="about_oshi__feature about_oshi__feature--worry">
            <img src="assets/images/about-06.png" alt="" class="about_oshi__feature_image" />
            <p class="about_oshi__feature_text">
              初めてで
              <br />
              不安なライブも
            </p>
          </div>

          <div class="about_oshi__feature about_oshi__feature--enjoy">
            <img src="assets/images/about-07.png" alt="" class="about_oshi__feature_image" />
            <p class="about_oshi__feature_text">
              準備の不安はぜんぶ預けて、
              <br />
              思いっきり楽しみませんか？
            </p>
          </div>
        </section>

        <!-- --------------------------------
          05 : エンディングメッセージ & ロゴ
        --------------------------------- -->
        <section class="about_end">
          <p class="about_end__text">
            楽しい推し活ライフに！！
            <br />
            あなたのそばに
          </p>
          <img src="assets/images/logo.png" alt="おしりーす" class="about_end__logo" />
        </section>
      </div>

      <!-- =========================
        フッター
      ========================== -->
      ${appFooter}

      <!-- =========================
        下部ナビ
      ========================== -->
      ${bottomNav}
    </main>
  
`,
  },

  usage: {
    page: "usage_guide.html",
    title: "使い方ガイド | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js"],
    markup: `
    <main class="app_shell usage_guide_page">
      ${guideHeader}

      <section class="usage_guide" aria-labelledby="usage-guide-title">
        <h1 id="usage-guide-title">使い方ガイド</h1>
        <section class="usage_guide__rental">
          <h2>借り方</h2>
          <ol class="usage_guide__steps">
            <li>
              <h3>1. 商品を選ぶ</h3>
              <div class="usage_guide__step_content">
                <div class="usage_guide__mock usage_guide__mock--search" aria-hidden="true">
                  <span>おしりーす</span>
                  <b>⌕</b>
                </div>
                <p>
                  アーティスト、汎用品、ライブ会場など
                  <br />
                  絞り込みをして検索
                </p>
              </div>
            </li>
            <li>
              <h3>2. 期間を選ぶ</h3>
              <div class="usage_guide__step_content">
                <div class="usage_guide__mock usage_guide__mock--calendar" aria-hidden="true">
                  <span>レンタル可能日</span>
                  <b>カレンダー</b>
                </div>
                <p>
                  商品を選択後、商品ページにてレンタル
                  <br />
                  期間を指定し、カートに追加
                </p>
              </div>
            </li>
            <li>
              <h3>3. 決済方法を選択</h3>
              <div class="usage_guide__step_content">
                <div class="usage_guide__mock usage_guide__mock--payment" aria-hidden="true">
                  <span>＜ 戻る</span>
                  <b>お支払い方法</b>
                </div>
                <p>決済方法を選んで決済をし注文完了</p>
              </div>
            </li>
          </ol>
        </section>

        <section class="usage_guide__section">
          <h2>返品の仕方</h2>
          <p>
            届けられた箱に入れ、中に入っている着払い伝票を貼って
            <br />
            レンタル終了日の24時までに郵便局かコンビニで発送する
          </p>
        </section>
        <section class="usage_guide__section" id="cancellation-refund">
          <h2>キャンセル払い戻し</h2>
          <p>利用者都合によるキャンセル料は、次のとおりとします。</p>
          <ul>
            <li>利用日の7日前まで：無料</li>
            <li>利用日の6日前から3日前まで：レンタル料金の50%</li>
            <li>利用日の2日前以降または無断キャンセル：レンタル料金の100%</li>
          </ul>
          <p>
            ・発送後にキャンセルする場合、発送済みの送料および返送料は、利用者の負担となります。
            <br />
            ・実際のキャンセル料が当社に通常生じる損害を超える場合は、法令に従って取り扱います。
          </p>
        </section>
        <section class="usage_guide__section">
          <h2>盗難・破損</h2>
          <ul>
            <li>初期不良 全額返金国内旅行の場合代替品配送</li>
            <li>使用において問題のない傷はお咎めなし</li>
            <li>料理や煙草ができるくらい　2000円上限</li>
            <li>修理不能　全額負担</li>
            <li>盗難・紛失　全額負担</li>
            <li>返却商品の汚れ、水濡れ　別途清掃料金請求</li>
          </ul>
        </section>
      </section>

      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  terms: {
    page: "terms.html",
    title: "利用規約 | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js"],
    markup: `
    <main class="app_shell privacy_policy_page terms_page">
      ${timerHeader}

      <article class="privacy_policy" aria-labelledby="terms-title">
        <h1 id="terms-title">おしりーす利用規約</h1>
        <p class="privacy_policy__date">制定日：2026年9月30日</p>
        <p>
          この利用規約（以下「本規約」といいます。）は、ときめき研究所（以下「当社」といいます。）が提供する推し活用品レンタルサービス「おしりーす」（以下「本サービス」といいます。）の利用条件を定めるものです。
        </p>

        <section>
          <h2>第1条　適用</h2>
          <p>
            本規約は、本サービスを利用するすべての方（以下「利用者」といいます。）に適用されます。
          </p>
          <p>利用者は、本規約に同意したうえで本サービスを利用するものとします。</p>
          <p>
            商品ページ、ご利用ガイド、キャンセル規定その他当社が本サービス上に掲載するルールは、本規約の一部を構成します。
          </p>
          <p>
            本規約と商品ページの記載が異なる場合は、商品ページに明記された個別条件が優先されます。
          </p>
        </section>
        <section>
          <h2>第2条　本サービスの内容</h2>
          <p>
            本サービスは、推し活用品や、権利者から許諾を得た公式グッズなどを一定期間貸し出すサービスです。
          </p>
          <p>
            公式グッズは、アーティストまたはその運営元などから許諾を得た商品のみを取り扱います。
          </p>
          <p>本サービスの利用によって、商品の所有権が利用者へ移ることはありません。</p>
          <p>
            商品の種類、料金、在庫、レンタル期間、受取方法および返却方法は、商品ごとに異なります。
          </p>
        </section>
        <section>
          <h2>第3条　会員登録</h2>
          <p>
            利用者は、正確な氏名、住所、電話番号、メールアドレスその他当社が求める情報を登録するものとします。
          </p>
          <p>登録内容に変更が生じた場合、利用者は速やかに情報を更新してください。</p>
          <p>虚偽の登録、他人になりすました登録、複数アカウントの不正利用は禁止します。</p>
          <p>アカウントの管理責任は利用者本人が負い、第三者への貸与または譲渡はできません。</p>
        </section>
        <section>
          <h2>第4条　未成年者の利用</h2>
          <p>
            未成年者は、親権者など法定代理人の同意を得たうえで利用してください。当社は、必要に応じて同意の確認を求める場合があります。
          </p>
        </section>
        <section>
          <h2>第5条　予約と契約の成立</h2>
          <p>
            利用者は、商品、利用日、レンタル期間、受取方法および料金を確認して予約を申し込みます。
          </p>
          <p>当社が予約を承諾し、予約完了の通知を送信した時点でレンタル契約が成立します。</p>
          <p>
            在庫不足、決済の不成立、登録情報の不備などがある場合、当社は予約を承諾しないことがあります。
          </p>
          <p>
            同じ商品への予約が重なった場合、決済が完了した順など、当社が定める方法で予約を確定します。
          </p>
        </section>
        <section>
          <h2>第6条　料金と支払い</h2>
          <p>
            利用者は、商品ページまたは申込確認画面に表示されたレンタル料金、送料、保証金その他の費用を支払います。
          </p>
          <p>支払方法と支払時期は、申込確認画面に表示します。</p>
          <p>
            予約確定前の最終確認画面には、支払総額、レンタル期間、受取方法、返却期限およびキャンセル条件を表示します。
          </p>
          <p>決済手数料や送料などが別途必要な場合は、予約確定前に表示します。</p>
        </section>
        <section>
          <h2>第7条　商品の受け取り</h2>
          <p>商品は、商品ページで指定された会場、店舗、配送先その他の場所で受け取ります。</p>
          <p>
            会場受け取りの場合、利用者は指定された時間内に本人確認書類または予約画面を提示してください。
          </p>
          <p>
            利用者の遅刻、本人確認不足、連絡不通などにより受け取れなかった場合、原則として利用者都合のキャンセルとして扱います。
          </p>
          <p>配送の場合、住所の誤入力や不在による再配送費用は利用者の負担とします。</p>
          <p>商品を受け取ったら、内容、数量、動作および外観を速やかに確認してください。</p>
        </section>
        <section>
          <h2>第8条　商品到着時の不具合</h2>
          <p>
            商品の不足、故障または著しい汚損があった場合、利用者は使用前に写真などを添えて当社へ連絡してください。
          </p>
          <p>
            当社が商品に問題があると判断した場合、交換、返金または料金の一部返還などを行います。
          </p>
          <p>使用後に連絡された破損等は、受取時から存在したことを確認できない場合があります。</p>
        </section>
        <section>
          <h2>第9条　商品の使用</h2>
          <p>利用者は、商品の説明および注意事項に従って使用してください。</p>
          <p>
            商品は予約者本人と、その同行者が通常の範囲で使用できます。ただし、第三者への転貸、転売または営業目的での使用は禁止します。
          </p>
          <p>
            改造、分解、塗装、シールの貼付、付属品の取り外しその他商品を変更する行為は禁止します。
          </p>
          <p>
            主催者または会場が使用を禁止している商品は使用できません。利用者は公演・会場のルールを事前に確認してください。
          </p>
          <p>
            商品の使用によって、公演への入場や特定の演出への参加が保証されるものではありません。
          </p>
        </section>
        <section>
          <h2>第10条　返却</h2>
          <p>
            利用者は、商品ページまたは予約画面に表示された期限と方法に従って商品を返却してください。
          </p>
          <p>
            会場返却の場合は指定時間までに返却窓口へ、配送返却の場合は指定日時までに配送業者へ引き渡してください。
          </p>
          <p>商品本体、ケース、ストラップ、説明書その他の付属品をすべて返却してください。</p>
          <p>
            配送時に指定外の方法を利用したことで追加費用が生じた場合、その費用は利用者の負担となります。
          </p>
        </section>
        <section>
          <h2>第11条　延滞</h2>
          <p>返却期限を過ぎた場合、利用者は商品ページに表示された延滞料金を支払います。</p>
          <p>返却が遅れることが分かった場合、利用者は期限前に当社へ連絡してください。</p>
          <p>
            連絡なく一定期間返却されない場合、当社は商品の紛失として扱い、商品相当額その他合理的な費用を請求することがあります。
          </p>
          <p>延滞料金は、当社に通常生じる損害を踏まえて商品ごとに定めます。</p>
        </section>
        <section>
          <h2>第12条　汚損・破損・紛失・盗難</h2>
          <p>通常の使用で生じた軽微な傷や劣化について、原則として費用は請求しません。</p>
          <p>
            利用者の故意または過失による破損、著しい汚損、付属品の不足がある場合、修理費、清掃費または再調達費など、当社に生じた合理的な費用を請求することがあります。
          </p>
          <p>
            商品を紛失または盗難により返却できない場合、利用者は速やかに当社へ連絡してください。当社は商品相当額などを請求することがあります。
          </p>
          <p>商品ごとの請求基準や補償制度がある場合は、商品ページに表示します。</p>
          <p>
            当社は、商品の状態が分かるよう、発送前・貸出前および返却後に写真や検品記録を保存することがあります。
          </p>
        </section>
        <section>
          <h2>第13条　キャンセル</h2>
          <p>利用者都合によるキャンセル料は、次のとおりとします。</p>
          <ul>
            <li>利用日の7日前まで：無料</li>
            <li>利用日の6日前から3日前まで：レンタル料金の50％</li>
            <li>利用日の2日前以降または無断キャンセル：レンタル料金の100％</li>
          </ul>
          <p>発送後にキャンセルする場合、発送済みの送料および返送料は利用者の負担となります。</p>
          <p>実際のキャンセル料が当社に通常生じる損害を超える場合は、法令に従って取り扱います。</p>
          <p>商品ごとに異なる条件がある場合は、商品ページおよび最終確認画面に表示します。</p>
        </section>
        <section>
          <h2>第14条　公演の中止・延期</h2>
          <p>公演の中止や延期によっても、本サービスの予約は自動的には取り消されません。</p>
          <p>商品の貸出前に公演中止が発表された場合のキャンセル条件は、商品ページに表示します。</p>
          <p>
            商品発送後または受け取り後に公演が中止された場合、送料や既に発生した費用を差し引いて返金することがあります。
          </p>
          <p>公演主催者によるチケット代、交通費、宿泊費などの補償は、本サービスでは行いません。</p>
        </section>
        <section>
          <h2>第15条　禁止事項</h2>
          <p>利用者は、次の行為を行ってはなりません。</p>
          <ul>
            <li>法令または公序良俗に違反する行為</li>
            <li>商品の転売、転貸、質入れまたは譲渡</li>
            <li>商品の複製、改造、分解または解析</li>
            <li>商品や掲載画像を利用した偽造品の製作</li>
            <li>アーティスト、運営元、他の利用者または当社への迷惑行為</li>
            <li>不正決済、虚偽申告、返却意思のない予約</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>
        </section>
        <section>
          <h2>第16条　知的財産権</h2>
          <p>
            本サービスに掲載されるロゴ、画像、文章、商品名などの権利は、当社または正当な権利者に帰属します。
          </p>
          <p>
            レンタルによって、アーティストの著作権、商標権、肖像権その他の権利が利用者へ移ることはありません。
          </p>
          <p>
            利用者は、私的使用として認められる範囲を超えて、掲載内容や商品を複製または利用してはなりません。
          </p>
          <p>本サービスと各アーティストとの関係は、商品ページに表示された提携範囲に限られます。</p>
        </section>
        <section>
          <h2>第17条　利用停止・契約解除</h2>
          <p>
            当社は、規約違反、不正利用、料金の未払い、度重なる延滞などがある場合、予約の取消し、利用停止または会員登録の解除を行うことがあります。
          </p>
        </section>
        <section>
          <h2>第18条　サービスの変更・停止</h2>
          <p>
            災害、通信障害、在庫事故、提携契約の終了その他やむを得ない事情がある場合、当社は本サービスの全部または一部を変更・停止することがあります。確定済みの予約に影響する場合は、返金や代替案を個別に案内します。
          </p>
        </section>
        <section>
          <h2>第19条　当社の責任</h2>
          <p>当社の責任によって利用者に損害が生じた場合、当社は法令に従って責任を負います。</p>
          <p>
            当社の故意または重大な過失による場合を除き、損害賠償の範囲は通常かつ直接の損害とします。
          </p>
          <p>
            本規約のうち、消費者契約法その他の法令により無効となる部分は、その範囲で適用されません。
          </p>
        </section>
        <section>
          <h2>第20条　個人情報</h2>
          <p>利用者の個人情報は、当社が別途定めるプライバシーポリシーに従って取り扱います。</p>
        </section>
        <section>
          <h2>第21条　規約の変更</h2>
          <p>
            当社は、法令の改正、サービス内容の変更その他必要がある場合、本規約を変更することがあります。重要な変更は、効力発生日までに本サービス上などで周知します。
          </p>
        </section>
        <section>
          <h2>第22条　準拠法・裁判管轄</h2>
          <p>本規約には日本法を適用します。</p>
          <p>
            本サービスに関する紛争については、法令で認められる範囲で、愛知県名古屋市を管轄する裁判所を第一審の管轄裁判所とします。
          </p>
        </section>
        <section>
          <h2>運営者情報</h2>
          <dl class="terms_operator">
            <div>
              <dt>制定日：</dt>
              <dd>2026年9月30日</dd>
            </div>
            <div>
              <dt>運営者：</dt>
              <dd>ときめき研究所</dd>
            </div>
            <div>
              <dt>所在地：</dt>
              <dd>〒453-0014 愛知県名古屋市中村区則武2-9-22</dd>
            </div>
            <div>
              <dt>
                問い合　
                <br />
                わせ先：
              </dt>
              <dd>
                <span>support@tokimekilab.example.com</span>
                <span>052-000-0000</span>
              </dd>
            </div>
          </dl>
        </section>
      </article>

      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  privacy: {
    page: "privacy_policy.html",
    title: "個人情報保護方針 | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js"],
    markup: `
    <main class="app_shell privacy_policy_page">
      ${guideHeader}

      <article class="privacy_policy" aria-labelledby="privacy-policy-title">
        <h1 id="privacy-policy-title">個人情報保護方針</h1>
        <p class="privacy_policy__date">制定日：2026年9月30日</p>
        <p>
          「おしりーす」（以下「本サービス」といいます。）は、ユーザーの個人情報を適切に保護することを重要な責務と考え、以下のとおり個人情報保護方針を定めます。
        </p>

        <section>
          <h2>1．取得する個人情報</h2>
          <p>本サービスは、サービスの提供に必要な範囲で、以下の情報を取得する場合があります。</p>
          <ul>
            <li>氏名</li>
            <li>ニックネーム</li>
            <li>電話番号</li>
            <li>住所</li>
            <li>レンタル商品の情報</li>
            <li>レンタル期間</li>
            <li>レンタル・利用履歴</li>
            <li>お支払い情報</li>
            <li>配送・返却に関する情報</li>
            <li>お問い合わせ内容</li>
            <li>本サービス利用および閲覧に関する情報</li>
          </ul>
          <p>
            なお、実際に取得する情報については、本サービスの提供内容に応じて必要な範囲に限ります。
          </p>
        </section>

        <section>
          <h2>2．個人情報の利用目的</h2>
          <p>本サービスは、取得した個人情報を、以下の目的で利用します。</p>
          <ol>
            <li>レンタルのお申し込み内容を確認するため</li>
            <li>レンタル商品の発送・配送を行うため</li>
            <li>レンタル商品の返却に関する対応を行うため</li>
            <li>お問い合わせに対応するため</li>
            <li>お支払いに関する確認・処理を行うため</li>
            <li>ユーザーへの連絡やメールの送信を行うため</li>
            <li>レンタルサービスを提供・運営するため</li>
            <li>よりよい商品やサービスを提供するため</li>
            <li>本サービスの利用状況を確認し、サービスの改善・運営に役立てるため</li>
            <li>本サービス利用に関する必要な連絡を行うため</li>
            <li>法令等に基づき必要な対応を行うため</li>
          </ol>
          <p>
            利用目的は、ユーザーが個人情報をどのような目的で利用されるのかを十分に理解できる限り具体的に定めることが求められています。
          </p>
        </section>

        <section>
          <h2>3．個人情報の適切な管理</h2>
          <p>
            本サービスは、取得した個人情報について、漏えい、紛失、破壊、不正アクセス、不正利用等を防止するため、適切な安全管理措置を講じます。
          </p>
          <p>また、個人情報を取り扱うについて、適切に管理・監督を行います。</p>
          <p>
            個人データについては、安全に管理するために必要かつ適切な措置を講じることが求められています。
          </p>
        </section>

        <section>
          <h2>5．個人情報の第三者提供</h2>
          <p>
            本サービスは、法令に基づく場合などを除き、あらかじめユーザー本人の同意を得ることなく、個人データを第三者に提供しません。
          </p>
          <p>ただし、本サービスの提供に必要な業務を外部の事業者へ委託する場合があります。</p>
          <p class="privacy_policy__example">例えば、</p>
          <ul class="privacy_policy__indent">
            <li>商品の配送</li>
            <li>決済処理</li>
            <li>システムの運営・管理</li>
            <li>メールの送信</li>
            <li>本サービスの運営に必要な業務</li>
          </ul>
          <p>などを外部事業者に委託する場合があります。</p>
          <p>
            この場合、本サービスは、委託先に対して個人情報が適切に管理されるよう必要な対応を行います。
          </p>
          <p>
            個人データを第三者へ提供する場合は、原則としてあらかじめ本人の同意を得ることが必要とされています。
          </p>
        </section>

        <section>
          <h2>6．個人情報の委託</h2>
          <p>
            本サービスは、サービス運営に必要な範囲で、個人情報の取り扱いを外部事業者に委託する場合があります。
          </p>
          <p>
            この場合、委託先を行い、適切な管理を行い、個人情報が適切に管理されるよう必要な監督を行います。
          </p>
          <p>
            また、委託先に対して、本サービスの提供に必要な範囲を超えて個人情報を利用しないよう求めます。
          </p>
        </section>

        <section>
          <h2>7．個人情報の開示・訂正・削除等</h2>
          <p>
            ユーザー本人から、自己の個人情報について、開示、訂正、追加、削除、利用停止等の請求があった場合、本サービスは本人確認を行ったうえで、法令に従い適切に対応します。
          </p>
          <p>ただし、法令等により対応できない場合は、その理由を説明する場合があります。</p>
        </section>

        <section>
          <h2>8．個人情報の保存期間</h2>
          <p>
            本サービスは、取得した個人情報について、利用目的を達成するために必要な期間、または法令上必要とされる期間、適切に管理します。
          </p>
          <p>利用する必要がなくなった個人情報については、適切な方法で削除または廃棄します。</p>
        </section>

        <section>
          <h2>9．未成年者の個人情報</h2>
          <p>
            本サービスは、未成年者が本サービスを利用する場合、その年齢や利用方法に応じて、必要な対応を行います。
          </p>
          <p>
            未成年者が本サービスを利用する場合は、必要に応じて保護者等の同意を得たうえで利用してください。
          </p>
        </section>

        <section>
          <h2>10．個人情報保護方針の変更</h2>
          <p>本サービスは、必要に応じて本方針の内容を変更することがあります。</p>
          <p>重要な変更がある場合には、本サービス上でお知らせします。</p>
        </section>

        <section>
          <h2>11．お問い合わせ</h2>
          <p>
            個人情報の取り扱いに関するお問い合わせ、開示・訂正・削除等のご請求については、以下の窓口までご連絡ください。
          </p>
          <p class="privacy_policy__contact">
            おしりーす お問い合わせ窓口
            <br />
            メールアドレス：support@tokimekilab.example.com
          </p>
        </section>
      </article>

      ${appFooter}
      ${bottomNav}
    </main>
  
`,
  },

  faq: {
    page: "faq.html",
    title: "よくある質問 | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js"],
    markup: `
    <main class="app_shell faq_page">
      ${accountHeader}

      <section class="faq" aria-labelledby="faq-title">
        <div class="faq__heading">
          <img src="assets/images/question-icon.png" alt="" />
          <div>
            <h1 id="faq-title">よくある質問</h1>
            <p>よくある質問をまとめました。</p>
          </div>
        </div>

        <section class="faq__category">
          <h2>レンタルについて</h2>
          <details class="faq_item">
            <summary>レンタル期間は何日間ですか？</summary>
            <div class="faq_item__answer">
              <p>基本料金は3泊4日です。商品によって異なる場合は、商品詳細ページに表示します。</p>
            </div>
          </details>
          <details class="faq_item">
            <summary>レンタル期間を延長できますか？</summary>
            <div class="faq_item__answer">
              <p>
                次の予約が入っていない場合に限り延長できます。延長料金は、1商品につき1日440円（税込）です。延長を希望する場合は、返却期限前にお問い合わせください。
              </p>
            </div>
          </details>
          <details class="faq_item">
            <summary>レンタルできない日を選べますか？</summary>
            <div class="faq_item__answer">
              <p>
                選べません。商品詳細ページから空き待ちリストへ登録すると、空きが出た際に通知を受け取る設定ができます。
              </p>
            </div>
          </details>
          <details class="faq_item">
            <summary>複数の商品を同時に借りられますか？</summary>
            <div class="faq_item__answer">
              <p>在庫があれば、複数の商品を同時にカートへ追加できます。</p>
            </div>
          </details>
        </section>

        <section class="faq__category">
          <h2>料金・支払いについて</h2>
          <details class="faq_item">
            <summary>送料はいくらですか？</summary>
            <div class="faq_item__answer">
              <p>
                1回のご注文につき、往復送料440円（税込）がかかります。送料を含む支払総額は、注文確定前の確認画面でご確認いただけます。
              </p>
            </div>
          </details>
          <details class="faq_item">
            <summary>利用できる支払い方法は何ですか？</summary>
            <div class="faq_item__answer">
              <p>
                クレジットカード、PayPay、後払い、コンビニ前払いを利用できます。後払いには250円（税込）、コンビニ前払いには220円（税込）の手数料がかかります。
              </p>
            </div>
          </details>
          <details class="faq_item">
            <summary>注文後に支払い方法を変更できますか？</summary>
            <div class="faq_item__answer">
              <p>
                注文確定後は変更できません。変更が必要な場合は、一度キャンセルして改めて注文してください。キャンセルの時期によっては、キャンセル料がかかります。
              </p>
            </div>
          </details>
        </section>

        <section class="faq__category">
          <h2>受け取り・返却について</h2>
          <details class="faq_item">
            <summary>商品はいつ届きますか？</summary>
            <div class="faq_item__answer">
              <p>
                選択したレンタル開始日までに届くよう発送します。配送状況はマイページから確認できます。
              </p>
            </div>
          </details>
          <details class="faq_item">
            <summary>返却方法を教えてください。</summary>
            <div class="faq_item__answer">
              <p>
                商品に同梱されている返却案内に従い、商品本体、ケース、ストラップなどの付属品をすべて入れて返送してください。
              </p>
            </div>
          </details>
          <details class="faq_item">
            <summary>返却期限を過ぎるとどうなりますか？</summary>
            <div class="faq_item__answer">
              <p>
                1商品につき1日440円（税込）の延長料金がかかります。返却が遅れることが分かった場合は、期限前にお問い合わせください。
              </p>
              <p>
                連絡なく一定期間返却されない場合は、紛失として商品相当額などをご請求することがあります。
              </p>
            </div>
          </details>
        </section>

        <section class="faq__category">
          <h2>空き待ちについて</h2>
          <details class="faq_item">
            <summary>レンタルしたい商品に空きがない場合はどうすればよいですか？</summary>
            <div class="faq_item__answer">
              <p>
                商品詳細ページから空き待ちリストへ登録できます。登録時に「通知を受け取る」を選択した方には、キャンセルなどで商品に空きが出た際に通知します。
              </p>
            </div>
          </details>
          <details class="faq_item">
            <summary>空き待ちリストに登録すれば、必ずレンタルできますか？</summary>
            <div class="faq_item__answer">
              <p>
                空き待ちリストへの登録は、商品の確保や予約を保証するものではありません。通知後の予約は先着順となります。
              </p>
            </div>
          </details>
          <details class="faq_item">
            <summary>通知が届いた商品は取り置きされますか？</summary>
            <div class="faq_item__answer">
              <p>
                商品の取り置きは行っていません。ほかの利用者が先に予約した場合、再びレンタルできなくなることがあります。
              </p>
            </div>
          </details>
        </section>

        <section class="faq__category">
          <h2>商品のトラブルについて</h2>
          <details class="faq_item">
            <summary>届いた商品に不具合があった場合はどうすればよいですか？</summary>
            <div class="faq_item__answer">
              <p>
                使用前に商品の状態が分かる写真を撮り、お問い合わせください。商品に問題があると確認できた場合は、交換、返金または料金の一部返還などを行います。
              </p>
            </div>
          </details>
          <details class="faq_item">
            <summary>商品を汚したり、壊したりした場合はどうなりますか？</summary>
            <div class="faq_item__answer">
              <p>
                通常の使用で生じた軽微な傷や劣化については、原則として費用を請求しません。故意または過失による破損、著しい汚れ、水濡れ、付属品の不足などがある場合は、修理費、清掃費または再調達費をご負担いただく場合があります。
              </p>
              <p>まずは商品の状態が分かる写真を添えてお問い合わせください。</p>
            </div>
          </details>
          <details class="faq_item">
            <summary>商品を紛失したり、盗難に遭った場合はどうすればよいですか？</summary>
            <div class="faq_item__answer">
              <p>
                速やかにお問い合わせください。商品を返却できない場合は、商品相当額などをご負担いただく場合があります。盗難の場合は、警察への届出をお願いすることがあります。
              </p>
            </div>
          </details>
          <details class="faq_item">
            <summary>ペンライトの電池は付属しますか？</summary>
            <div class="faq_item__answer">
              <p>
                動作確認済みの電池を入れた状態でお届けします。付属品の詳細は商品詳細ページをご確認ください。
              </p>
            </div>
          </details>
          <details class="faq_item">
            <summary>商品の色や種類は選べますか？</summary>
            <div class="faq_item__answer">
              <p>商品詳細ページで、在庫がある色・種類・機能を選択できます。</p>
            </div>
          </details>
        </section>

        <section class="faq__category">
          <h2>キャンセルについて</h2>
          <details class="faq_item">
            <summary>注文をキャンセルできますか？</summary>
            <div class="faq_item__answer">
              <p>マイページの「キャンセル・払い戻し」からお手続きいただけます。</p>
              <ul>
                <li>利用日の7日前まで：無料</li>
                <li>利用日の6日前から3日前まで：レンタル料金の50％</li>
                <li>利用日の2日前以降または無断キャンセル：レンタル料金の100％</li>
              </ul>
              <p>発送後は、発送済みの送料および返送料をご負担いただきます。</p>
            </div>
          </details>
          <details class="faq_item">
            <summary>公演が中止・延期になった場合、注文も自動的にキャンセルされますか？</summary>
            <div class="faq_item__answer">
              <p>
                公演の中止や延期だけでは、自動的にキャンセルされません。発送状況などによって対応が異なるため、「キャンセル・払い戻し」ページをご確認ください。
              </p>
              <p>
                発送後または商品受取後の場合は、送料などの発生済み費用を差し引いて返金することがあります。
              </p>
            </div>
          </details>
        </section>

        <section class="faq__category">
          <h2>アカウントについて</h2>
          <details class="faq_item">
            <summary>推しカラーは変更できますか？</summary>
            <div class="faq_item__answer">
              <p>設定の「推しカラー変更」からいつでも変更できます。</p>
            </div>
          </details>
          <details class="faq_item">
            <summary>パスワードを忘れた場合はどうすればよいですか？</summary>
            <div class="faq_item__answer">
              <p>ログイン画面の「パスワードをお忘れの方」から再設定できます。</p>
            </div>
          </details>
          <details class="faq_item">
            <summary>お気に入りやカートの商品は保存されますか？</summary>
            <div class="faq_item__answer">
              <p>同じアカウントでログインしている場合、登録した商品を確認できます。</p>
            </div>
          </details>
        </section>

        <div class="faq__links">
          <p>詳しい利用方法や規定もご確認いただけます。</p>
          <a href="guide.html?view=usage">使い方ガイドを見る</a>
          <a href="guide.html?view=terms">利用規約を見る</a>
          <a href="rental.html?view=cancel">キャンセル・払い戻しを見る</a>
        </div>
      </section>

      ${appFooter}

      ${bottomNav}
    </main>
  
`,
  },

  help: {
    page: "help.html",
    title: "ヘルプ | おしりーす",
    bodyAttributes: { class: "mobile_app" },
    scripts: ["user_storage.js", "app.js"],
    markup: `
    <main class="app_shell help_page">
      ${accountHeader}

      <section class="help" aria-labelledby="help-title">
        <div class="help__heading">
          <img src="assets/images/help-icon.png" alt="" />
          <div>
            <h1 id="help-title">ヘルプ</h1>
            <p>どのようなことでお困りですか？</p>
          </div>
        </div>

        <section class="help__urgent" aria-labelledby="help-trouble-title">
          <div>
            <span class="help__mark" aria-hidden="true">!</span>
            <div>
              <h2 id="help-trouble-title">商品にトラブルがあった方</h2>
              <p>故障・不足・破損・紛失・返却の遅れはこちら</p>
            </div>
          </div>
          <a href="account.html?view=contact">お問い合わせへ</a>
        </section>

        <section class="help__section">
          <h2>注文・レンタル</h2>
          <nav class="help_menu" aria-label="注文・レンタルのヘルプ">
            <a href="rental.html?view=history">
              <span>
                <strong>注文内容・配送状況を確認したい</strong>
                <small>レンタル履歴を確認できます</small>
              </span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
            <a href="rental.html?view=cancel">
              <span>
                <strong>注文をキャンセルしたい</strong>
                <small>キャンセル条件や払い戻しを確認できます</small>
              </span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
            <a href="guide.html?view=usage">
              <span>
                <strong>レンタル・返却方法を知りたい</strong>
                <small>商品の借り方から返却までをご案内します</small>
              </span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
            <a href="account.html?view=waitlist">
              <span>
                <strong>借りたい商品の在庫がない</strong>
                <small>空き待ちリストを確認できます</small>
              </span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
          </nav>
        </section>

        <section class="help__section">
          <h2>アカウント・支払い</h2>
          <nav class="help_menu" aria-label="アカウント・支払いのヘルプ">
            <a href="account.html?view=profile">
              <span>
                <strong>登録情報を確認・変更したい</strong>
                <small>会員情報を確認できます</small>
              </span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
            <a href="account.html?view=password">
              <span>
                <strong>パスワードを再設定したい</strong>
                <small>新しいパスワードを設定できます</small>
              </span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
            <a href="account.html?view=color">
              <span>
                <strong>推しカラーを変更したい</strong>
                <small>アプリに反映するカラーを選べます</small>
              </span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
            <a href="account.html?view=card">
              <span>
                <strong>クレジットカードを登録・変更したい</strong>
                <small>お支払いに使うカードを管理できます</small>
              </span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
            <a href="guide.html?view=faq">
              <span>
                <strong>支払い方法について確認したい</strong>
                <small>料金・支払いのよくある質問を確認できます</small>
              </span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
          </nav>
        </section>

        <section class="help__section">
          <h2>サービスについて</h2>
          <nav class="help_menu" aria-label="サービスについてのヘルプ">
            <a href="guide.html?view=faq">
              <span><strong>よくある質問を見る</strong></span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
            <a href="guide.html?view=terms">
              <span><strong>利用規約を確認する</strong></span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
            <a href="guide.html?view=privacy">
              <span><strong>個人情報保護方針を確認する</strong></span>
              <span class="help_menu__arrow" aria-hidden="true">›</span>
            </a>
          </nav>
        </section>

        <section class="help__contact">
          <h2>解決しない場合</h2>
          <p>お問い合わせページから、詳しい状況をお知らせください。</p>
          <a href="account.html?view=contact">お問い合わせ</a>
        </section>
      </section>

      ${appFooter}

      ${bottomNav}
    </main>
  
`,
  },
};
