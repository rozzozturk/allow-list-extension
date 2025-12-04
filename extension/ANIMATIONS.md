# 🎨 Keepnet Assistant – Animation System

## ✨ Framer Motion–Style Animation System

This extension uses **Vanilla JavaScript** to deliver professional-quality animations inspired by **Framer Motion**.

---

## 📋 Animation Categories

### 1. **Entrance Animations**
Used when elements first appear on the screen.

#### Available Animations:
- `fadeIn` – Smooth fade-in effect  
- `fadeInUp` – Fade-in while sliding up  
- `slideInRight` – Slide in from the right  
- `slideInBottom` – Slide in from the bottom  
- `scaleIn` – Scale up from the center  
- `rotateIn` – Rotate and scale in  

**Usage:**
```javascript
AnimationUtils.animate(element, 'fadeInUp', 400)
```

---

### 2. **Attention Animations**
Used to draw the user’s attention to a specific element.

#### Available Animations:
- `pulse` – Pulse effect (grow/shrink)  
- `pulse-glow` – Glowing pulse effect  
- `bounce` – Bounce effect  
- `shake` – Shake effect  

**Usage:**
```javascript
AnimationUtils.animate(element, 'pulse', 600)
```

---

### 3. **Progress Animations**
Used for progress bars and counters.

#### Functions:
```javascript
// Progress bar animation (0–100%)
AnimationUtils.animateProgressBar(progressBar, fromPercent, toPercent, 500)

// Counter animation
AnimationUtils.animateCounter(element, from, to, duration, suffix)
```

**Example:**
```javascript
// Animate from 0% to 75%
AnimationUtils.animateProgressBar(progressBar, 0, 75, 600)

// Count from 0 to 100
AnimationUtils.animateCounter(counterEl, 0, 100, 1000, '%')
```

---

### 4. **Exit Animations**
Used when elements leave the screen.

#### Available Animations:
- `fadeOut` – Smooth fade-out  
- `slideOutRight` – Slide out to the right  

---

### 5. **Interactive Animations**

#### Highlight System:
```javascript
// Highlight an element and animate it
AnimationUtils.highlightElement(element)

// Remove the highlight (with animation)
AnimationUtils.removeHighlight(element)

// Smooth scroll to an element
AnimationUtils.scrollToElement(element, offsetY)
```

---

### 6. **Stagger Animations**
Animates child elements one by one.

```javascript
// Animate all children inside the parent with a 50ms delay
AnimationUtils.staggerChildren(parentElement, 'fadeInUp', 50)
```

**Used in:**
- Step list on the summary screen  
- Footer buttons  
- Tooltips  

---

### 7. **Celebration Effects**

#### Confetti Effect:
```javascript
// Fire 50 colorful confetti particles! 🎉
AnimationUtils.showConfetti(containerElement)
```

**Properties:**
- 50 particles  
- Purple tones (#7c3aed, #6366f1, #8b5cf6, #a78bfa, #c4b5fd)  
- 360° random spread  
- 1–1.5 second duration  
- Automatic cleanup  

---

## 🎯 Animation Parameters

### Easing Functions:
```javascript
// Spring-based cubic-bezier (Framer Motion–like)
'cubic-bezier(0.34, 1.56, 0.64, 1)'  // Default spring easing

// Other easing functions
'ease-in-out'
'ease-out'
'linear'
```

### Duration:
- **Fast**: 200–300ms (button hover, tooltips)  
- **Normal**: 400–500ms (standard animations)  
- **Slow**: 600–1000ms (large elements, progress)  

---

## 📍 Usage Locations

### 1. **Panel Animations**
```javascript
// Panel entrance
this.container.style.animation = 'keepnet-slide-in-right 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
```

### 2. **Progress Bar**
```javascript
updateProgress(current, total) {
  const percent = Math.round((current / total) * 100)
  const currentWidth = parseInt(progressBar.style.width) || 0
  AnimationUtils.animateProgressBar(progressBar, currentWidth, percent, 600)
}
```

### 3. **Error/Success Messages**
```javascript
showError(message) {
  // ...
  AnimationUtils.animate(errorEl, 'fadeInUp', 400)
}

showSuccess(message) {
  // ...
  AnimationUtils.animate(successEl, 'scaleIn', 500)
}
```

### 4. **Element Highlight**
```javascript
highlightElement(element, tooltipText) {
  element.classList.add('keepnet-highlight')
  AnimationUtils.animate(element, 'pulse', 600)
  AnimationUtils.scrollToElement(element)
  
  // Tooltip animasyonu
  AnimationUtils.animate(this.tooltip, 'fadeInUp', 400)
}
```

### 5. **Summary Screen**
```javascript
showSummary() {
  // Confetti celebration
  setTimeout(() => {
    AnimationUtils.showConfetti(document.body)
  }, 300)
  
  // Stagger animation
  setTimeout(() => {
    const summaryItems = this.panel.body.querySelectorAll('.keepnet-summary > div > div')
    AnimationUtils.staggerChildren(summaryItems[0].parentElement, 'fadeInUp', 80)
  }, 100)
}
```

---

## 🎨 CSS Animations

### Keyframe Animations:
All animations are defined in `content.css`:

```css
@keyframes keepnet-fade-in-up {
  from { 
    opacity: 0; 
    transform: translateY(20px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
}
```

### Hover Effects:
```css
button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02) !important;
  box-shadow: 0 8px 16px rgba(124, 58, 237, 0.4) !important;
}

button:active:not(:disabled) {
  transform: translateY(0) scale(0.98) !important;
}
```

---

## ⚡ Performance Optimization

### 1. **Hardware Acceleration**
All `transform` and `opacity` changes are processed on the GPU:
```css
transform: translateX(0) scale(1);
opacity: 1;
```

### 2. **requestAnimationFrame**
`requestAnimationFrame` is used for smooth 60fps animations:
```javascript
const animate = (currentTime) => {
  // Animation logic
  if (progress < 1) {
    requestAnimationFrame(animate)
  }
}
requestAnimationFrame(animate)
```

### 3. **Will-Change**
`will-change` is used on critical elements to improve performance:
```css
transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 🚀 Future Improvements

- [ ] Parallax scroll effects  
- [ ] Morphing transitions  
- [ ] Particle systems  
- [ ] Gesture-based animations  
- [ ] Physics-based springs  
- [ ] Lottie animation support  

---

## 📚 References

- **Framer Motion**: https://www.framer.com/motion/  
- **Cubic-bezier**: https://cubic-bezier.com/  
- **Web Animations API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API  

---

**Version:** 4.0  
**Last Updated:** 2025  
**License:** Keepnet Labs  

