const width = window.innerWidth - 100
const height = window.innerHeight - 150
let maxY = 0
let intervalID = 0
const svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

let particles = []

let v0 = document.getElementById('v-0')
let x0 = document.getElementById('x-0')
let y0 = document.getElementById('y-0')
let environment = document.getElementById('environment')
let a = document.getElementById('a')
let angle = document.getElementById('angle')
let color = document.getElementById('color')
const btnChart = document.getElementById('btn-chart')
const btnClear = document.getElementById('btn-clear')

function addParticle() {
  let validatedX =
    parseFloat(x0.value) > 0
      ? parseFloat(x0.value) + width / 2
      : width / 2 - Math.abs(parseFloat(x0.value))
  let validatedY =
    parseFloat(y0.value) > 0
      ? height / 2 - parseFloat(y0.value)
      : Math.abs(parseFloat(y0.value)) + height / 2

  let particle = new Particle(
    validatedX,
    validatedY,
    v0.value,
    angle.value,
    color.value,
    a.value,
    environment.value
  )
  particles.push(particle)
}

function clearParticles() {
  particles = []
  svg.selectAll('*').remove()
  clearInterval(intervalID)
  animate()
}

function Particle(x0, y0, v0, angle, color, a, resistance) {
  this.x0 = parseFloat(x0)
  this.y0 = parseFloat(y0)
  this.color = color
  this.v0 = parseFloat(v0)
  this.a = parseFloat(a) / 10
  this.angle = (-parseFloat(angle) * Math.PI) / 180
  this.startTime = Date.now()
  this.g = 9.8
  this.lastHeight = null
  this.resistance = parseFloat(resistance)
  this.x = 0

  this.draw = () => {
    let currentTime = Date.now()
    let elapsedTime = currentTime - this.startTime
    let t = elapsedTime / 1000

    let vX = this.v0 * Math.cos(this.angle)
    let vY = this.v0 * Math.sin(this.angle)

    // Incorporate drag resistance into velocity
    let dragX = this.resistance * vX
    let dragY = this.resistance * vY

    vX -= dragX * t
    vY -= dragY * t

    let aX = this.a * Math.cos(this.angle)
    let aY = this.a * Math.sin(this.angle) + this.g

    let x = this.x0 + vX * t + 0.5 * aX * t ** 2
    let y = this.y0 + vY * t + 0.5 * aY * t ** 2

    if (this.lastHeight === null) {
      this.lastHeight = { x: x, y: y }
    }

    this.x = x

    if (this.lastHeight.y < y && !this.isMaxPrinted) {
      this.isMaxPrinted = true
      svg
        .append('circle')
        .attr('cx', this.lastHeight.x)
        .attr('cy', this.lastHeight.y)
        .attr('r', 5)
        .style('fill', 'yellow')

      let validatedY = height / 2 - this.lastHeight.y

      svg
        .append('text')
        .attr('x', this.lastHeight.x - 30)
        .attr('y', this.lastHeight.y - 35)
        .text(`h(max) = ${validatedY.toFixed(2)} m`)
        .attr('font-family', 'monospace')
        .attr('font-weight', '600')
        .attr('color', 'black')
        .attr('z-index', '999')
        .attr('font-size', '10px')
    }

    if (y > this.y0 && !this.infoPrinted) {
      this.infoPrinted = true

      let distance = x - x0

      svg
        .append('text')
        .attr('x', this.lastHeight.x - 30)
        .attr('y', this.lastHeight.y - 25)
        .text(`d = ${distance.toFixed(2)} m, t = ${t.toFixed(2)} с`)
        .attr('font-family', 'monospace')
        .attr('font-weight', '600')
        .attr('color', 'black')
        .attr('z-index', '999')
        .attr('font-size', '10px')
    }

    svg
      .append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 5)
      .style('fill', this.color)

    if (!this.isMaxPrinted) {
      this.lastHeight.x = x
      this.lastHeight.y = y
    }
  }
}

function Grid(scale = 50) {
  this.scale = scale
  this.cX = width / 2
  this.cY = height / 2

  this.draw = () => {
    for (let y = this.cY; y < height; y += this.scale) {
      svg
        .append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', width)
        .attr('y2', y)
        .style('stroke', 'blue')
    }

    for (let y = this.cY; y > 0; y -= this.scale) {
      svg
        .append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', width)
        .attr('y2', y)
        .style('stroke', 'blue')
    }

    for (let x = this.cX; x < width; x += this.scale) {
      svg
        .append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', height)
        .style('stroke', 'blue')
    }

    for (let x = this.cX; x > 0; x -= this.scale) {
      svg
        .append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', height)
        .style('stroke', 'blue')
    }
  }
}

function Axes(scale) {
  this.scale = scale
  this.cX = width / 2
  this.cY = height / 2

  this.draw = () => {
    svg
      .append('line')
      .attr('x1', this.cX)
      .attr('y1', 0)
      .attr('x2', this.cX)
      .attr('y2', height)
      .style('stroke', 'black')

    svg
      .append('line')
      .attr('x1', 0)
      .attr('y1', this.cY)
      .attr('x2', width)
      .attr('y2', this.cY)
      .style('stroke', 'black')

    let markup = new Markup(this.scale)
    markup.draw()
  }
}

function Markup(scale) {
  this.scale = scale
  this.cX = width / 2
  this.cY = height / 2

  this.draw = () => {
    for (let x = this.cX; x < width; x += scale) {
      let valX = this.getValidatedX(x)
      if (valX == 0) continue
      svg
        .append('text')
        .attr('x', x - 10)
        .attr('y', this.cY + 15)
        .text(valX)
        .attr('font-family', 'monospace')
        .attr('font-size', '14px')
    }

    for (let x = this.cX; x > 0; x -= scale) {
      let valX = this.getValidatedX(x)
      svg
        .append('text')
        .attr('x', x - 15)
        .attr('y', this.cY + 15)
        .text(valX)
        .attr('font-family', 'monospace')
        .attr('font-size', '14px')
    }

    for (let y = this.cY; y < height; y += scale) {
      let valY = this.getValidatedY(y)
      if (valY == 0) continue
      svg
        .append('text')
        .attr('x', this.cX + 5)
        .attr('y', y)
        .text(valY)
        .attr('font-family', 'monospace')
        .attr('font-size', '14px')
    }

    for (let y = this.cY; y > 0; y -= scale) {
      let valY = this.getValidatedY(y)
      if (valY == 0) continue
      svg
        .append('text')
        .attr('x', this.cX + 5)
        .attr('y', y)
        .text(valY)
        .attr('font-family', 'monospace')
        .attr('font-size', '14px')
    }

    this.drawAxesName()
  }

  this.getValidatedX = x => {
    return x > this.cX ? x - this.cX : (this.cX - x) * -1
  }

  this.getValidatedY = y => {
    return y > this.cY ? this.cY - y : (y - this.cY) * -1
  }

  this.drawAxesName = () => {
    svg
      .append('text')
      .attr('x', this.cX - 50)
      .attr('y', 15)
      .text('y')
      .attr('font-family', 'monospace')
      .attr('font-size', '20px')
      .attr('font-weight', '600')
    svg
      .append('text')
      .attr('x', this.cX - 35)
      .attr('y', 18)
      .text('(м)')
      .attr('font-family', 'monospace')
      .attr('font-size', '14px')
      .attr('font-weight', '600')

    svg
      .append('text')
      .attr('x', width - 50)
      .attr('y', this.cY - 10)
      .text('x')
      .attr('font-family', 'monospace')
      .attr('font-size', '20px')
      .attr('font-weight', '600')
    svg
      .append('text')
      .attr('x', width - 35)
      .attr('y', this.cY - 10)
      .text('(м)')
      .attr('font-family', 'monospace')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
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
  let board = new Board(50)
  board.draw()
  intervalID = setInterval(() => {
    particles.forEach(particle => {
      if (!particle.infoPrinted) particle.draw()
    })
  }, 150)
}

animate()
