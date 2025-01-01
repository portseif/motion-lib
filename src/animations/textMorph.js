import { animate } from "motion";

export function textMorph(element, texts, options = {}) {
    const { duration = 1000, loop = true } = options;
    let index = 0;

    const morph = () => {
        const nextIndex = (index + 1) % texts.length;
        const nextText = texts[nextIndex];

        animate(
            element,
            { opacity: [0, 1] },
            { duration: duration / 1000 }
        ).finished.then(() => {
            element.textContent = nextText;
            index = nextIndex;
            if (loop) morph();
        });
    };

    element.textContent = texts[index];
    morph();
}
