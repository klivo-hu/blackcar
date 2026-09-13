const faqs = document.querySelectorAll(".kerdesek");

faqs.forEach(kerdesek => {
    kerdesek.addEventListener("click", () => {
        kerdesek.classList.toggle("active");
    });
})