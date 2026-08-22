<template lang="pug">
  //- ── Wood ──
  //-
  //- A stacked cord seen end-on: two logs under one, with growth rings and
  //- bark. A single log read as a brown pill at this size; the stack and the
  //- rings are what make it unmistakably timber.
  //-
  //- Sized by the caller (e.g. `class="w-4 h-4"`), like every other icon here.
  svg(viewBox="0 0 24 24" aria-hidden="true")
    //- Back log, a tone down so the pile has depth.
    g
      rect(x="4" y="13.4" width="12" height="7.2" rx="1" fill="#8a5a2b")
      ellipse(cx="16" cy="17" rx="3.1" ry="3.6" fill="#a9682f" stroke="#5e3a17" stroke-width="1")
      ellipse(cx="16" cy="17" rx="1.7" ry="2" fill="none" stroke="#7a4a20" stroke-width="0.9")
      ellipse(cx="16" cy="17" rx="0.5" ry="0.7" fill="#7a4a20")
    //- Second log of the bottom course, tucked left.
    g
      rect(x="2" y="13.8" width="7" height="6.6" rx="1" fill="#7d5127")
      ellipse(cx="9" cy="17.1" rx="2.7" ry="3.2" fill="#9a5f2b" stroke="#5e3a17" stroke-width="0.9")
      ellipse(cx="9" cy="17.1" rx="1.4" ry="1.7" fill="none" stroke="#6e4219" stroke-width="0.8")
    //- Top log, lit: the brightest thing in the glyph.
    g
      rect(x="5.5" y="5.6" width="11" height="7" rx="1" fill="#c2853f")
      path(d="M5.5 6.6 h11" stroke="#e2ab63" stroke-width="1.1" stroke-linecap="round")
      path(d="M6.4 11.4 h9.5" stroke="#8a5a2b" stroke-width="0.9" stroke-linecap="round")
      ellipse(cx="16.5" cy="9.1" rx="3.3" ry="3.8" fill="#d99a53" stroke="#5e3a17" stroke-width="1.1")
      ellipse(cx="16.5" cy="9.1" rx="2" ry="2.4" fill="none" stroke="#a06a2c" stroke-width="1")
      ellipse(cx="16.5" cy="9.1" rx="0.9" ry="1.1" fill="none" stroke="#a06a2c" stroke-width="0.9")
      ellipse(cx="16.5" cy="9.1" rx="0.35" ry="0.45" fill="#8a5a2b")
</template>
