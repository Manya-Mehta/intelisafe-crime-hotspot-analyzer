let clickCount = 0;
const version = document.getElementById("version");

if (version) {
  version.addEventListener("click", () => {
    clickCount++;
    if (clickCount === 7) {
      window.location.href = "/choice.html";
      clickCount = 0; // reset so it works again next time
    }
  });
}
