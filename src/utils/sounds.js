let audioCtx = null

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

function playTone(freq, duration, type = 'sine', gain = 0.3, delay = 0) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay)
    gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration)
  } catch {
    // Audio not available
  }
}

export function playCoinRevoke() {
  playTone(400, 0.25, 'sawtooth', 0.2)
  playTone(280, 0.2, 'sawtooth', 0.15, 0.15)
}

export function playBankIt() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => playTone(freq, 0.4, 'sine', 0.3, i * 0.13))
}

export function playPrizeRequest() {
  playTone(784, 0.18, 'sine', 0.25)
  playTone(1047, 0.3, 'sine', 0.25, 0.16)
}

export function playApprove() {
  playTone(659, 0.15, 'sine', 0.28)
  playTone(784, 0.15, 'sine', 0.28, 0.12)
  playTone(1047, 0.3, 'sine', 0.28, 0.24)
}

export function playGoal() {
  // 5-note triumphant fanfare ascending — feels like a goal horn
  const notes = [523, 659, 784, 1047, 1319]
  notes.forEach((freq, i) => playTone(freq, 0.3, 'sine', 0.28, i * 0.12))
}

export function playDecline() {
  playTone(300, 0.4, 'sawtooth', 0.2)
}

export function playPINTap() {
  playTone(880, 0.08, 'sine', 0.18)
}

export function playError() {
  playTone(220, 0.4, 'sawtooth', 0.22)
  playTone(180, 0.3, 'sawtooth', 0.18, 0.15)
}

export function playLetterCorrect() {
  playTone(880, 0.12, 'sine', 0.22)
}

export function playLetterIncorrect() {
  playTone(200, 0.15, 'sawtooth', 0.18)
}
