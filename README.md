# MotionLib

MotionLib is a framework-agnostic animation library built using [Motion One](https://motion.dev). It supports animations like text morphing, fades, and slides with ease.

## Installation

Install via npm:
```bash
npm install @portseif/motion-lib
```

## Usage

To use MotionLib in your project, you can import the desired animations and use them as follows:

```javascript
import { textMorph } from '@portseif/motion-lib';

textMorph(document.getElementById('textElement'), ['Hello', 'World'], { duration: 2000 });
```

This will animate the text content of the element with the ID `textElement` from "Hello" to "World" over a duration of 2 seconds.
