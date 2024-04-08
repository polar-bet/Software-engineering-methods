const canvas = document.getElementById('myCanvas')
const c = canvas.getContext('2d')
canvas.width = window.innerWidth - 100
canvas.height = window.innerHeight - 150

let particles = []

let v0 = document.getElementById('v-0')
let x0 = document.getElementById('x-0')
let y0 = document.getElementById('y-0')
let a = document.getElementById('a')
let angle = document.getElementById('angle')
let color = document.getElementById('color')
const btnChart = document.getElementById('btn-chart')
const btnClear = document.getElementById('btn-clear')

function addParticle() {
  let validatedX =
    parseFloat(x0.value) > 0
      ? parseFloat(x0.value) + canvas.width / 2
      : canvas.width / 2 - Math.abs(parseFloat(x0.value))
  let validatedY =
    parseFloat(y0.value) > 0
      ? canvas.height / 2 - parseFloat(y0.value)
      : Math.abs(parseFloat(y0.value)) + canvas.height / 2

  let particle = new Particle(
    validatedX,
    validatedY,
    v0.value,
    a.value,
    angle.value,
    color.value
  )
  particles.push(particle)
}

function clearParticles() {
  particles = []
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.fillStyle = 'black'
  c.fill()
}

function Particle(x0, y0, v0, a, angle, color) {
  this.x0 = parseFloat(x0)
  this.y0 = parseFloat(y0)
  this.color = color
  this.v0 = parseFloat(v0)
  this.a = parseFloat(a)
  this.angle = (-parseFloat(angle) * Math.PI) / 180
  this.startTime = Date.now()

  this.draw = () => {
    let currentTime = Date.now()
    let elapsedTime = currentTime - this.startTime
    let t = elapsedTime / 1000

    let x =
      this.x0 +
      this.v0 * t * Math.cos(this.angle) +
      ((a * t ** 2) / 2) * Math.cos(this.angle)
    let y =
      this.y0 +
      this.v0 * t * Math.sin(this.angle) +
      ((a * t ** 2) / 2) * Math.sin(this.angle)

    c.beginPath()
    c.arc(x, y, 5, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
  }
}

function Grid(scale = 50) {
  this.scale = scale
  this.cX = canvas.width / 2
  this.cY = canvas.height / 2

  this.draw = () => {
    c.beginPath()

    for (let y = this.cY; y < canvas.height; y += this.scale) {
      c.moveTo(0, y)
      c.lineTo(canvas.width, y)
    }

    for (let y = this.cY; y > 0; y -= this.scale) {
      c.moveTo(0, y)
      c.lineTo(canvas.width, y)
    }

    for (let x = this.cX; x < canvas.width; x += this.scale) {
      c.moveTo(x, 0)
      c.lineTo(x, canvas.height)
    }

    for (let x = this.cX; x > 0; x -= this.scale) {
      c.moveTo(x, 0)
      c.lineTo(x, canvas.height)
    }

    c.strokeStyle = 'blue'
    c.stroke()
    c.closePath()
  }
}

function Axes(scale) {
  this.scale = scale
  this.cX = canvas.width / 2
  this.cY = canvas.height / 2

  this.draw = () => {
    c.beginPath()
    c.moveTo(this.cX, 0)
    c.lineTo(this.cX, canvas.height)
    c.moveTo(0, this.cY)
    c.lineTo(canvas.width, this.cY)
    c.strokeStyle = 'black'
    c.stroke()
    c.closePath()

    let markup = new Markup(this.scale)
    markup.draw()
  }
}

function Markup(scale) {
  this.scale = scale
  this.cX = canvas.width / 2
  this.cY = canvas.height / 2

  this.draw = () => {
    c.beginPath()
    c.font = '14px monospace'

    for (let x = this.cX; x < canvas.width; x += scale) {
      let valX = this.getValidatedX(x)
      c.fillText(valX, x - 10, this.cY + 15)
      if (valX == 0) continue
    }

    for (let x = this.cX; x > 0; x -= scale) {
      let valX = this.getValidatedX(x)
      if (valX == 0) continue
      c.fillText(valX, x - 15, this.cY + 15)
    }

    for (let y = this.cY; y < canvas.height; y += scale) {
      let valY = this.getValidatedY(y)
      if (valY == 0) continue
      c.fillText(valY, this.cX + 5, y - 5)
    }

    for (let y = this.cY; y > 0; y -= scale) {
      let valY = this.getValidatedY(y)
      if (valY == 0) continue
      c.fillText(valY, this.cX + 5, y - 5)
    }

    c.closePath()

    this.drawAxesName()
  }

  this.getValidatedX = x => {
    return x > this.cX ? x - this.cX : (this.cX - x) * -1
  }

  this.getValidatedY = y => {
    return y > this.cY ? this.cY - y : (y - this.cY) * -1
  }

  this.drawAxesName = () => {
    c.beginPath()
    c.font = '25px console'
    c.fillText('y', this.cX - 50, 20)
    c.fillText('x', canvas.width - 45, this.cY - 10)
    c.font = '14px console'
    c.fillText('(см)', this.cX - 35, 18)
    c.fillText('(см)', canvas.width - 30, this.cY - 10)

    c.closePath()
  }
}

function Board(scale) {
  this.scale = scale

  this.draw = () => {
    let grid = new Grid(this.scale)
    let axes = new Axes(this.scale)
    grid.draw()
    axes.draw()
  }
}

function animate() {
  setInterval(() => {
    particles.forEach(particle => {
      particle.draw()
    })

    let board = new Board(50)
    board.draw()
  }, 500)
}

animate()
