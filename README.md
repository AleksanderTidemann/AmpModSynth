# Amplitude Modulation Web App

An upgrade of the p5 [amplitude modulation example sketch](https://p5js.org/examples/sound-amplitude-modulation.html). Control the modulator's frequency and amplitude with mouse movements, and the carrier frequency with a small slider. Ready to implement inn any web application as it supports the new [auto-play policies](https://developer.chrome.com/blog/autoplay/) in Chrome (resumes/suspends Web Audio Context when/if the user want's to play).

<script src="./src/app/p5.js"></script>
<script src="./src/app/p5.sound.js"></script>
<script src="./src/app/p5.sound.min.js"></script>
<script src="./src/app/app.js"></script>
<div id="synth-holder"></div>
