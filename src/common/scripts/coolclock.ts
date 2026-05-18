/**
 * CoolClock 2.1.4
 * Copyright 2010, Simon Baird
 * Released under the BSD License.
 *
 * Display an analog clock using canvas.
 * http://randomibis.com/coolclock/
 */

export interface SkinElement {
  lineWidth: number;
  radius?: number;
  startAt?: number;
  endAt?: number;
  color: string;
  alpha: number;
  fillColor?: string;
}

export interface Skin {
  outerBorder?: SkinElement;
  smallIndicator?: SkinElement;
  largeIndicator?: SkinElement;
  hourHand?: SkinElement;
  minuteHand?: SkinElement;
  secondHand?: SkinElement;
  secondDecoration?: SkinElement;
}

export interface CoolClockOptions {
  canvasId: string;
  skin?: string;
  displayRadius?: number;
  showSecondHand?: boolean;
  gmtOffset?: number | null;
  showDigital?: boolean;
  logClock?: boolean;
  logClockRev?: boolean;
}

export const DEFAULT_SKINS: Record<string, Skin> = {
  swissRail: {
    outerBorder: { lineWidth: 2, radius: 95, color: 'black', alpha: 1 },
    smallIndicator: { lineWidth: 2, startAt: 88, endAt: 92, color: 'black', alpha: 1 },
    largeIndicator: { lineWidth: 4, startAt: 79, endAt: 92, color: 'black', alpha: 1 },
    hourHand: { lineWidth: 8, startAt: -15, endAt: 50, color: 'black', alpha: 1 },
    minuteHand: { lineWidth: 7, startAt: -15, endAt: 75, color: 'black', alpha: 1 },
    secondHand: { lineWidth: 1, startAt: -20, endAt: 85, color: 'red', alpha: 1 },
    secondDecoration: {
      lineWidth: 1,
      startAt: 70,
      radius: 4,
      fillColor: 'red',
      color: 'red',
      alpha: 1,
    },
  },
  chunkySwiss: {
    outerBorder: { lineWidth: 4, radius: 97, color: 'black', alpha: 1 },
    smallIndicator: { lineWidth: 4, startAt: 89, endAt: 93, color: 'black', alpha: 1 },
    largeIndicator: { lineWidth: 8, startAt: 80, endAt: 93, color: 'black', alpha: 1 },
    hourHand: { lineWidth: 12, startAt: -15, endAt: 60, color: 'black', alpha: 1 },
    minuteHand: { lineWidth: 10, startAt: -15, endAt: 85, color: 'black', alpha: 1 },
    secondHand: { lineWidth: 4, startAt: -20, endAt: 85, color: 'red', alpha: 1 },
    secondDecoration: {
      lineWidth: 2,
      startAt: 70,
      radius: 8,
      fillColor: 'red',
      color: 'red',
      alpha: 1,
    },
  },
  chunkySwissOnBlack: {
    outerBorder: { lineWidth: 4, radius: 97, color: 'white', alpha: 1 },
    smallIndicator: { lineWidth: 4, startAt: 89, endAt: 93, color: 'white', alpha: 1 },
    largeIndicator: { lineWidth: 8, startAt: 80, endAt: 93, color: 'white', alpha: 1 },
    hourHand: { lineWidth: 12, startAt: -15, endAt: 60, color: 'white', alpha: 1 },
    minuteHand: { lineWidth: 10, startAt: -15, endAt: 85, color: 'white', alpha: 1 },
    secondHand: { lineWidth: 4, startAt: -20, endAt: 85, color: 'red', alpha: 1 },
    secondDecoration: {
      lineWidth: 2,
      startAt: 70,
      radius: 8,
      fillColor: 'red',
      color: 'red',
      alpha: 1,
    },
  },
};

export class CoolClock {
  static config = {
    tickDelay: 1000,
    longTickDelay: 15000,
    defaultRadius: 85,
    renderRadius: 100,
    defaultSkin: 'chunkySwiss',
    showSecs: true,
    showAmPm: true,
    skins: { ...DEFAULT_SKINS } as Record<string, Skin>,
    clockTracker: {} as Record<string, CoolClock>,
    noIdCount: 0,
    isIE: false,
  };

  canvasId: string;
  skin: string;
  displayRadius: number;
  renderRadius: number;
  showSecondHand: boolean;
  gmtOffset: number | null;
  showDigital: boolean;
  logClock: boolean;
  logClockRev: boolean;
  tickDelay: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scale: number;

  constructor(options: CoolClockOptions) {
    this.canvasId = options.canvasId;
    this.skin = options.skin ?? CoolClock.config.defaultSkin;
    this.displayRadius = options.displayRadius ?? CoolClock.config.defaultRadius;
    this.showSecondHand = options.showSecondHand ?? true;
    this.gmtOffset = options.gmtOffset ?? null;
    this.showDigital = options.showDigital ?? false;
    this.logClock = options.logClock ?? false;
    this.logClockRev = options.logClockRev ?? false;

    this.tickDelay = CoolClock.config[this.showSecondHand ? 'tickDelay' : 'longTickDelay'];

    this.canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas element with id ${this.canvasId} not found`);
    }

    this.renderRadius = CoolClock.config.renderRadius;

    this.ctx = this.canvas.getContext('2d')!;
    this.setRadius(this.displayRadius);

    CoolClock.config.clockTracker[this.canvasId] = this;
    this.tick();
  }

  setSkin(skin: string): this {
    this.skin = skin || CoolClock.config.defaultSkin;
    return this;
  }

  setOffset(gmtOffset: number | null): this {
    this.gmtOffset = gmtOffset;
    return this;
  }

  setRadius(displayRadius: number): this {
    this.displayRadius = displayRadius || CoolClock.config.defaultRadius;
    this.canvas.setAttribute('width', (this.displayRadius * 2).toString());
    this.canvas.setAttribute('height', (this.displayRadius * 2).toString());
    this.canvas.style.width = `${this.displayRadius * 2}px`;
    this.canvas.style.height = `${this.displayRadius * 2}px`;
    this.scale = this.displayRadius / this.renderRadius;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
    this.ctx.scale(this.scale, this.scale);
    return this;
  }

  setSecondHand(enable: boolean): this {
    this.showSecondHand = enable;
    this.tickDelay = CoolClock.config[this.showSecondHand ? 'tickDelay' : 'longTickDelay'];
    return this;
  }

  setShowDigital(enable: boolean): this {
    this.showDigital = enable;
    return this;
  }

  fullCircleAt(x: number, y: number, skin: SkinElement): void {
    this.ctx.save();
    this.ctx.globalAlpha = skin.alpha;
    this.ctx.beginPath();
    this.ctx.arc(x, y, skin.radius!, 0, 2 * Math.PI, false);
    if (skin.fillColor) {
      this.ctx.fillStyle = skin.fillColor;
      this.ctx.fill();
    } else {
      this.ctx.lineWidth = skin.lineWidth;
      this.ctx.strokeStyle = skin.color;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawTextAt(theText: string, x: number, y: number): void {
    this.ctx.save();
    this.ctx.font = '15px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(theText, x, y);
    this.ctx.restore();
  }

  lpad2(num: number): string {
    return num.toString().padStart(2, '0');
  }

  tickAngle(second: number): number {
    // Log algorithm by David Bradshaw
    const tweak = 3; // If it's lower the one-second mark looks wrong (?)
    if (this.logClock) {
      return second === 0 ? 0 : Math.log(second * tweak) / Math.log(60 * tweak);
    } else if (this.logClockRev) {
      const revSecond = (60 - second) % 60;
      return 1.0 - (revSecond === 0 ? 0 : Math.log(revSecond * tweak) / Math.log(60 * tweak));
    } else {
      return second / 60.0;
    }
  }

  timeText(hour: number, min: number, sec: number): string {
    const c = CoolClock.config;
    if (!c.showAmPm) {
      return `${this.lpad2(hour)}:${this.lpad2(min)}${c.showSecs ? `:${this.lpad2(sec)}` : ''}`;
    } else {
      const suffix = hour < 12 ? ' am' : ' pm';
      const h = hour % 12 || 12;
      return `${h}:${this.lpad2(min)}${c.showSecs ? `:${this.lpad2(sec)}` : ''}${suffix}`;
    }
  }

  radialLineAtAngle(angleFraction: number, skin: SkinElement): void {
    this.ctx.save();
    this.ctx.translate(this.renderRadius, this.renderRadius);
    this.ctx.rotate(Math.PI * (2.0 * angleFraction - 0.5));
    this.ctx.globalAlpha = skin.alpha;
    this.ctx.strokeStyle = skin.color;
    this.ctx.lineWidth = skin.lineWidth;

    if (skin.radius) {
      this.fullCircleAt(skin.startAt!, 0, skin);
    } else {
      this.ctx.beginPath();
      this.ctx.moveTo(skin.startAt!, 0);
      this.ctx.lineTo(skin.endAt!, 0);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  render(hour: number, min: number, sec: number): void {
    let skin = CoolClock.config.skins[this.skin];
    if (!skin) skin = CoolClock.config.skins[CoolClock.config.defaultSkin];

    this.ctx.clearRect(0, 0, this.renderRadius * 2, this.renderRadius * 2);

    if (skin.outerBorder) {
      this.fullCircleAt(this.renderRadius, this.renderRadius, skin.outerBorder);
    }

    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) {
        if (skin.largeIndicator) {
          this.radialLineAtAngle(i / 60, skin.largeIndicator);
        }
      } else {
        if (skin.smallIndicator) {
          this.radialLineAtAngle(i / 60, skin.smallIndicator);
        }
      }
    }

    if (this.showDigital) {
      this.drawTextAt(
        this.timeText(hour, min, sec),
        this.renderRadius,
        this.renderRadius + this.renderRadius / 2,
      );
    }

    if (skin.hourHand) {
      this.radialLineAtAngle((hour % 12) / 12 + min / 720, skin.hourHand);
    }

    if (skin.minuteHand) {
      this.radialLineAtAngle(min / 60 + sec / 3600, skin.minuteHand);
    }

    if (this.showSecondHand && skin.secondHand) {
      this.radialLineAtAngle(this.tickAngle(sec), skin.secondHand);
    }

    if (this.showSecondHand && skin.secondDecoration) {
      this.radialLineAtAngle(this.tickAngle(sec), skin.secondDecoration);
    }
  }

  refreshDisplay(): void {
    const now = new Date();
    if (this.gmtOffset !== null) {
      const offsetNow = new Date(now.getTime() + this.gmtOffset * 3600 * 1000);
      this.render(offsetNow.getUTCHours(), offsetNow.getUTCMinutes(), offsetNow.getUTCSeconds());
    } else {
      this.render(now.getHours(), now.getMinutes(), now.getSeconds());
    }
  }

  nextTick(): void {
    setTimeout(() => {
      this.tick();
    }, this.tickDelay);
  }

  stillHere(): boolean {
    return !!document.getElementById(this.canvasId);
  }

  tick(): void {
    if (this.stillHere()) {
      this.refreshDisplay();
      this.nextTick();
    }
  }
}
