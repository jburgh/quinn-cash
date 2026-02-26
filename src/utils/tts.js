export function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.85
  u.pitch = 1.1
  window.speechSynthesis.speak(u)
}

export function spellAloud(word) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  word.toUpperCase().split('').forEach((letter, i) => {
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(letter)
      u.rate = 0.7
      window.speechSynthesis.speak(u)
    }, i * 600)
  })
}
