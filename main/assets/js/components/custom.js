const isElement = (selector) => document.body.contains(document.querySelector(selector))
const handleBlockBodyScroll = (node) => {
    document.body.dataset.locked = node.dataset.lockBody === "true" ? "true" : "false"
}

const loadAccordion = () => {
    if (!isElement("[data-js='accordion']"))
        return;

    const accordions = document.querySelectorAll("[data-js='accordion']")
    accordions.forEach(elem => elem.addEventListener('click', function (e) {
        const accordion = e.target.closest("[data-js='accordion']")
        accordion.dataset.open = accordion.dataset.open === "true" ? "false" : "true"
    }))
}

const loadCarousels = () => {
    if (!isElement(".swiper"))
        return;

    const swiper = new Swiper(".swiper", {
        pagination: {
            el: ".swiper-pagination",
            bulletClass: "inline-block h-2 w-2 rounded-full bg-notActive",
            bulletActiveClass: "bg-primary"

        },
        // Navigation arrows
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
            navigationDisabledClass: "bg-notActive"
        },
    })
}

const loadActivators = () => {
    if (!isElement("[data-js='activators']"))
        return;

    const activators = document.querySelectorAll("[data-js='activators']")
    activators.forEach(elem => elem.addEventListener('click', function (e) {
        const activator = e.target.closest("[data-js='activators']")
        const targetSelector = activator.dataset.target;
        if (!targetSelector || !isElement(targetSelector))
            return;

        const target = document.querySelector(targetSelector)
        handleBlockBodyScroll(activator)
        target.dataset.open = target.dataset.open === "true" ? "false" : "true"
    }))
}

const bootstrap = () => {
    loadAccordion()
    loadActivators()
    loadCarousels();
}
bootstrap()