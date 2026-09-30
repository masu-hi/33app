document.querySelectorAll('input[type="password"]').forEach((input) => {
  const wrapper = document.createElement("span");
  const button = document.createElement("button");

  wrapper.className = "password_input";
  input.parentNode.insertBefore(wrapper, input);
  wrapper.append(input);

  button.className = "password_input__toggle";
  button.type = "button";
  button.innerHTML = '<span class="password_input__icon" aria-hidden="true"></span>';
  button.setAttribute("aria-label", "パスワードを表示");
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    const isVisible = input.type === "text";
    input.type = isVisible ? "password" : "text";
    button.setAttribute("aria-pressed", String(!isVisible));
    button.setAttribute("aria-label", isVisible ? "パスワードを表示" : "パスワードを隠す");
  });

  wrapper.append(button);
});
