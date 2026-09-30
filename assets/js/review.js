// ========================================
// レビュー投稿
// ========================================

const reviewSubmitButton = document.querySelector('[data-review-submit]');
const reviewTextarea = document.querySelector('.review_form__textarea');
const reviewStars = document.querySelectorAll('.review_form__stars button');
const reviewList = document.querySelector('.review_list');

let selectedRating = 0;
let savedReviews = JSON.parse(
    localStorage.getItem('oshleaseReviews')
) || [];


// 星を選択
reviewStars.forEach((star, index) => {

    star.addEventListener('click', () => {

        selectedRating = index + 1;

        reviewStars.forEach((item, itemIndex) => {

            item.classList.toggle(
                'is_selected',
                itemIndex < selectedRating
            );

        });

    });

});

// 現在のレビュー数と平均評価
let totalReviewCount = 15300;
let totalRatingPoints = 15300 * 4.5;
// 保存されているレビューを表示
savedReviews.forEach((review) => {
    const newReview = document.createElement('article');
    newReview.className = 'review_item';

    const stars = '★'.repeat(review.rating) +
        '☆'.repeat(5 - review.rating);

    newReview.innerHTML = `
        <div class="review_item__header">
            <span class="review_item__stars">
                ${stars}
            </span>

            <span class="review_item__score">
                ${review.rating}/5
            </span>

            <time datetime="${review.date}">
                ${review.dateText}
            </time>
        </div>

        <p class="review_item__text">
            ${review.text.replace(/\n/g, '<br>')}
        </p>
    `;

    reviewList.prepend(newReview);
});


// レビュー投稿
reviewSubmitButton?.addEventListener('click', () => {

    // 評価が選ばれていない場合
    if (selectedRating === 0) {
        alert('評価を選択してください');
        return;
    }

    // レビュー本文が空の場合
    const reviewText = reviewTextarea.value.trim();

    if (reviewText === '') {
        alert('レビューを入力してください');
        return;
    }


    // 今日の日付
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const dateText = `${year}.${month}.${day}`;


    // 星を作る
    const stars = '★'.repeat(selectedRating) +
        '☆'.repeat(5 - selectedRating);


    // 新しいレビューを作成
    const newReview = document.createElement('article');

    newReview.className = 'review_item';

    newReview.innerHTML = `
        <div class="review_item__header">

            <span class="review_item__stars">
                ${stars}
            </span>

            <span class="review_item__score">
                ${selectedRating}/5
            </span>

            <time datetime="${year}-${month}-${day}">
                ${dateText}
            </time>

        </div>

        <p class="review_item__text">
            ${reviewText.replace(/\n/g, '<br>')}
        </p>
    `;


    reviewList.prepend(newReview);


    // ========================================
    // レビューを保存
    // ========================================

    savedReviews.unshift({
        rating: selectedRating,
        text: reviewText,
        date: `${year}-${month}-${day}`,
        dateText: dateText
    });

    localStorage.setItem(
        'oshleaseReviews',
        JSON.stringify(savedReviews)
    );


    // レビュー件数と平均評価を更新
    totalReviewCount++;
    totalRatingPoints += selectedRating;

    updateReviewSummary();


    // フォームをリセット
    reviewTextarea.value = '';

    selectedRating = 0;

    reviewStars.forEach((star) => {
        star.classList.remove('is_selected');
    });


    // 投稿完了
    alert('レビューを投稿しました！');

});

// ========================================
// レビュー集計
// ========================================

const reviewCountElement =
    document.querySelector('[data-review-count]');

const reviewAverageElement =
    document.querySelector('[data-review-average]');

const reviewSummaryStars =
    document.querySelector('[data-review-summary-stars]');


// レビュー情報を更新する関数
function updateReviewSummary() {
    const averageRating =
        totalRatingPoints / totalReviewCount;

    const roundedAverage =
        Math.round(averageRating * 10) / 10;

    reviewCountElement.textContent =
        `${totalReviewCount.toLocaleString()}件のレビュー`;

    reviewAverageElement.textContent =
        roundedAverage.toFixed(1);


    // ========================================
    // 星の表示
    // ========================================

    let stars = '';

    for (let i = 1; i <= 5; i++) {

        // その星が完全に埋まる
        if (roundedAverage >= i) {
            stars += `
                <span class="star is_full">★</span>
            `;

            // その星が半分だけ埋まる
        } else if (roundedAverage >= i - 0.5) {
            stars += `
                <span class="star is_half">★</span>
            `;

            // 空の星
        } else {
            stars += `
                <span class="star">★</span>
            `;
        }
    }

    reviewSummaryStars.innerHTML = stars;
}