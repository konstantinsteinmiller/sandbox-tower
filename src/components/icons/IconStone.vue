<template lang="pug">
  //- ── Stone ──
  //-
  //- Two faceted blocks, each cut into a lit top plane and a shadowed face. One
  //- flat pentagon read as a grey smudge; the plane break is what makes it read
  //- as cut rock.
  //-
  //- Sized by the caller (e.g. `class="w-4 h-4"`), like every other icon here.
  svg(viewBox="0 0 24 24" aria-hidden="true")
    //- Back block.
    g(stroke="#39404a" stroke-width="1" stroke-linejoin="round")
      path(d="M2.6 12.4 L7 9.6 L12.4 11.4 L11.6 17.6 L4.4 18.6 Z" fill="#6a727d")
      path(d="M2.6 12.4 L7 9.6 L12.4 11.4 L7.6 13.4 Z" fill="#8d97a3")
    //- Front block, larger and a step lighter — the one the eye lands on.
    g(stroke="#39404a" stroke-width="1.2" stroke-linejoin="round")
      path(d="M9.4 13 L15.2 8.8 L21.4 11.8 L20.4 19.4 L11.4 20.4 Z" fill="#78818d")
      path(d="M9.4 13 L15.2 8.8 L21.4 11.8 L15.6 14.6 Z" fill="#a7b2bf")
      path(d="M15.6 14.6 L21.4 11.8 L20.4 19.4 Z" fill="#5f6772")
    //- Two chips of quartz catching the light.
    path(d="M13.2 11.4 L15 10.6 L14.4 12 Z" fill="#dfe7f0")
    path(d="M4.8 12.2 L6.4 11.4 L5.9 12.7 Z" fill="#c9d3de")
</template>
