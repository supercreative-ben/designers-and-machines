export type Track = {
  id: string;
  name: string;
  /** Strudel pattern code, evaluated by @strudel/web. */
  code: string;
};

export const TRACKS: Track[] = [
  {
    id: "one",
    name: "One",
    code: `arrange(
  [10, note("[C G], <D Fb B C A>*[0.5,2]")
    .sound("sawtooth").cpm(30).gain(.4)
    .lpf("<100 150 200 250 300 350 400 450 400 350 300 250 200 150>/4")
    .room(1).pan("<0 1>/2")
    .delay(1).roomsize("10")
    .slow(".1275").gain(.08)],
  [12, note("[C G], <D Fb B C A>*[0.5,2]")
    .sound("sawtooth").cpm(30).gain(.4)
    .lpf("<100 200 300 400 500 600 700 800 900 1000 1100 1200 1300 1400 1300 1200 1100 1000 900 800 700 600 500 400 300 200>/4")
    .room(1).pan("<0 1>/2")
    .delay(1).roomsize("10")
    .slow(".1275").gain(.13)],
  [12, note("[A E], <C B E G A>*[0.5,2]")
    .sound("sawtooth").cpm(30).gain(.4)
    .lpf("<100 200 300 400 500 600 700 800 900 1000 1100 1200 1300 1400 1300 1200 1100 1000 900 800 700 600 500 400 300 200>/4")
    .room(1).pan("<1 0>/2")
    .delay(1).roomsize("10")
    .slow(".1275").gain(.15)],
  [12, stack(
    note("[A E], <C B E G A>*[0.5,2]")
      .sound("sawtooth").cpm(30).gain(.4)
      .lpf("<200 350 500 650 800 950 1100 1250 1400 1250 1100 950 800 650 500 350>/4")
      .room(1).pan("<1 0>/2")
      .delay(1).roomsize("10")
      .slow(".1275").gain(.15),
    note("<A4 C5 B4 E5 G4>*[0.5,2]")
      .sound("triangle").cpm(30).gain(.3)
      .lpf("<600 800 1000 1200 1000 800>/4")
      .room(1).pan("<0 1>/2")
      .delay(1).roomsize("10")
      .slow(".1275").gain(.04)
  )],
  [12, stack(
    note("[F C], <G A E D C>*[0.5,2]")
      .sound("sawtooth").cpm(30).gain(.4)
      .lpf("<200 350 500 650 800 950 1100 1250 1400 1250 1100 950 800 650 500 350>/4")
      .room(1).pan("<0 1>/2")
      .delay(1).roomsize("10")
      .slow(".1275").gain(.16),
    note("<C5 A4 G4 E5 D5>*[0.5,2]")
      .sound("triangle").cpm(30).gain(.3)
      .lpf("<700 900 1100 1300 1100 900>/4")
      .room(1).pan("<1 0>/2")
      .delay(1).roomsize("10")
      .slow(".1275").gain(.05)
  )],
  [10, note("[F C], <G A E D C>*[0.5,2]")
    .sound("sawtooth").cpm(30).gain(.4)
    .lpf("<900 800 700 600 500 400 300 250>/3")
    .room(1).pan("<0 1>/2")
    .delay(1).roomsize("10")
    .slow(".1275").gain(.12)],
  [12, note("[C G], <D Fb B C A>*[0.5,2]")
    .sound("sawtooth").cpm(30).gain(.4)
    .lpf("<100 200 300 400 500 600 700 800 900 1000 1100 1200 1300 1400 1300 1200 1100 1000 900 800 700 600 500 400 300 200>/4")
    .room(1).pan("<0 1>/2")
    .delay(1).roomsize("10")
    .slow(".1275").gain(.12)],
  [10, note("[C G], <D Fb B C A>*[0.5,2]")
    .sound("sawtooth").cpm(30).gain(.4)
    .lpf("<400 350 300 250 200 160 120 100>/4")
    .room(1).pan("<0 1>/2")
    .delay(1).roomsize("12")
    .slow(".1275").gain(.07)]
)`,
  },
  {
    id: "two",
    name: "Two",
    code: `setcps(0.375)
arrange(
  [6, note("<[eb3 bb3 g4 bb3 eb4 bb3 g4 bb3] [d3 a3 f#4 a3 d4 a3 f#4 a3] [g3 d4 bb4 d4 g4 d4 bb4 d4] [d3 a3 f#4 a3 d4 a3 f#4 a3]>")
    .s("triangle").decay(0.24).sustain(0).release(0.1)
    .lpf(sine.range(400,900).slow(9))
    .gain("0.2 0.13 0.17 0.13 0.2 0.13 0.17 0.13")
    .delay(0.4).delaytime(0.25).delayfeedback(0.45)
    .room(0.7).pan(sine.slow(7).range(0.35,0.65))],
  [6, stack(
    note("<[eb3 bb3 g4 bb3 eb4 bb3 g4 bb3] [d3 a3 f#4 a3 d4 a3 f#4 a3] [g3 d4 bb4 d4 g4 d4 bb4 d4] [d3 a3 f#4 a3 d4 a3 f#4 a3]>")
      .s("triangle").decay(0.24).sustain(0).release(0.1)
      .lpf(sine.range(480,1100).slow(9))
      .gain("0.24 0.15 0.2 0.15 0.24 0.15 0.2 0.15")
      .delay(0.4).delaytime(0.25).delayfeedback(0.45)
      .room(0.65).pan(sine.slow(7).range(0.35,0.65)),
    note("<eb1 d1 g1 d1>").struct("x ~ ~ x ~ x ~ ~")
      .s("sine").decay(0.35).sustain(0.25).release(0.2).gain(0.2).lpf(130)
  )],
  [8, stack(
    note("<[eb3 bb3 g4 bb3 eb4 bb3 g4 bb3] [d3 a3 f#4 a3 d4 a3 f#4 a3] [g3 d4 bb4 d4 g4 d4 bb4 d4] [d3 a3 f#4 a3 d4 a3 f#4 a3]>")
      .s("triangle").decay(0.24).sustain(0).release(0.1)
      .lpf(sine.range(550,1300).slow(9))
      .gain("0.26 0.17 0.22 0.17 0.26 0.17 0.22 0.17")
      .delay(0.4).delaytime(0.25).delayfeedback(0.45)
      .room(0.65).pan(sine.slow(7).range(0.35,0.65)),
    note("<[eb2,g2,bb2] [d2,f#2,a2] [g2,bb2,d3] [d2,f#2,a2]>")
      .s("sawtooth").unison(3).detune(0.14).chorus(0.5)
      .attack(0.7).release(1.8)
      .lpf(sine.range(380,850).slow(15)).gain(0.015).room(0.85),
    note("<eb1 d1 g1 d1>").struct("x ~ ~ x ~ x ~ ~")
      .s("sine").decay(0.35).sustain(0.25).release(0.2).gain(0.22).lpf(130),
    note("c1*4").s("sine").decay(0.11).sustain(0).gain(0.13).lpf(140)
  )],
  [8, stack(
    note("<[g4 eb4 bb3 g3 bb3 eb4 g4 bb4] [f#4 d4 a3 f#3 a3 d4 f#4 a4] [bb4 g4 d4 bb3 d4 g4 bb4 d5] [f#4 d4 a3 f#3 a3 d4 f#4 a4]>")
      .s("triangle").decay(0.24).sustain(0).release(0.1)
      .lpf(sine.range(500,1200).slow(11))
      .gain("0.24 0.16 0.2 0.16 0.24 0.16 0.2 0.16")
      .delay(0.4).delaytime(0.25).delayfeedback(0.45)
      .room(0.65).pan(sine.slow(8).range(0.3,0.7)),
    note("<[eb2,g2,bb2] [d2,f#2,a2] [g2,bb2,d3] [d2,f#2,a2]>")
      .s("sawtooth").unison(3).detune(0.14).chorus(0.5)
      .attack(0.7).release(1.8)
      .lpf(sine.range(420,900).slow(13)).gain(0.015).room(0.85),
    note("<eb1 d1 g1 d1>").struct("x ~ x ~ ~ x ~ x")
      .s("sine").decay(0.35).sustain(0.25).release(0.2).gain(0.22).lpf(130),
    note("c1*4").s("sine").decay(0.11).sustain(0).gain(0.13).lpf(140)
  )],
  [6, stack(
    note("<[eb3 ~ g4 ~ bb3 eb4 ~ g4] [d3 ~ f#4 ~ a3 d4 ~ f#4] [g3 ~ bb4 ~ d4 g4 ~ bb4] [d4 ~ f#4 ~ a4 d4 ~ f#4]>")
      .s("triangle").decay(0.26).sustain(0).release(0.12)
      .lpf(sine.range(600,1400).slow(10))
      .gain(0.24)
      .delay(0.5).delaytime(0.375).delayfeedback(0.5)
      .room(0.7).pan(sine.slow(6).range(0.3,0.7)),
    note("<[eb2,g2,bb2] [d2,f#2,a2] [g2,bb2,d3] [d2,f#2,a2]>")
      .s("sawtooth").unison(3).detune(0.14).chorus(0.5)
      .attack(0.9).release(2)
      .lpf(sine.range(380,850).slow(15)).gain(0.015).room(0.88),
    note("<eb1 d1 g1 d1>").struct("x ~ ~ x ~ x x ~")
      .s("sine").decay(0.35).sustain(0.25).release(0.2).gain(0.23).lpf(130),
    note("c1*4").s("sine").decay(0.11).sustain(0).gain(0.13).lpf(140)
  )],
  [8, stack(
    note("<[eb3 bb3 g4 bb3 eb4 bb3 g4 bb3] [d3 a3 f#4 a3 d4 a3 f#4 a3] [g3 d4 bb4 d4 g4 d4 bb4 d4] [d3 a3 f#4 a3 d4 a3 f#4 a3]>")
      .s("triangle").decay(0.24).sustain(0).release(0.1)
      .lpf(sine.range(650,1500).slow(8))
      .gain("0.26 0.17 0.22 0.17 0.26 0.17 0.22 0.17")
      .delay(0.4).delaytime(0.25).delayfeedback(0.45)
      .room(0.65).pan(sine.slow(7).range(0.35,0.65)),
    note("<[g4 eb4 bb3 g3 bb3 eb4 g4 bb4] [f#4 d4 a3 f#3 a3 d4 f#4 a4] [bb4 g4 d4 bb3 d4 g4 bb4 d5] [f#4 d4 a3 f#3 a3 d4 f#4 a4]>")
      .s("triangle").decay(0.22).sustain(0).release(0.1)
      .lpf(sine.range(700,1400).slow(10)).gain(0.12)
      .delay(0.5).delaytime(0.375).delayfeedback(0.5)
      .room(0.7).pan(sine.slow(5).range(0.25,0.75)),
    note("<[eb2,g2,bb2] [d2,f#2,a2] [g2,bb2,d3] [d2,f#2,a2]>")
      .s("sawtooth").unison(3).detune(0.14).chorus(0.5)
      .attack(0.7).release(1.8)
      .lpf(sine.range(420,950).slow(13)).gain(0.02).room(0.85),
    note("<eb1 d1 g1 d1>").struct("x x ~ x ~ x x ~")
      .s("sine").decay(0.35).sustain(0.25).release(0.2).gain(0.23).lpf(130),
    note("c1*4").s("sine").decay(0.11).sustain(0).gain(0.14).lpf(140)
  )],
  [6, stack(
    note("<[eb2,g2,bb2] [d2,f#2,a2] [g2,bb2,d3] [d2,f#2,a2]>")
      .s("sawtooth").unison(3).detune(0.14).chorus(0.5)
      .attack(1.2).release(2.4)
      .lpf(sine.range(320,700).slow(15)).gain(0.03).room(0.92),
    note("<eb1 d1 g1 d1>").struct("x ~ ~ x ~ ~ ~ ~")
      .s("sine").decay(0.4).sustain(0.25).release(0.3).gain(0.2).lpf(120)
  )],
  [8, stack(
    note("<[g4 eb4 bb3 g3 bb3 eb4 g4 bb4] [f#4 d4 a3 f#3 a3 d4 f#4 a4] [bb4 g4 d4 bb3 d4 g4 bb4 d5] [f#4 d4 a3 f#3 a3 d4 f#4 a4]>")
      .s("triangle").decay(0.24).sustain(0).release(0.1)
      .lpf(sine.range(500,1200).slow(11))
      .gain("0.24 0.16 0.2 0.16 0.24 0.16 0.2 0.16")
      .delay(0.4).delaytime(0.25).delayfeedback(0.45)
      .room(0.65).pan(sine.slow(8).range(0.3,0.7)),
    note("<[eb2,g2,bb2] [d2,f#2,a2] [g2,bb2,d3] [d2,f#2,a2]>")
      .s("sawtooth").unison(3).detune(0.14).chorus(0.5)
      .attack(0.7).release(1.8)
      .lpf(sine.range(420,900).slow(13)).gain(0.015).room(0.85),
    note("<eb1 d1 g1 d1>").struct("x ~ x ~ ~ x ~ x")
      .s("sine").decay(0.35).sustain(0.25).release(0.2).gain(0.22).lpf(130),
    note("c1*4").s("sine").decay(0.11).sustain(0).gain(0.13).lpf(140)
  )],
  [6, note("<[eb3 bb3 g4 bb3 eb4 bb3 g4 bb3] [d3 a3 f#4 a3 d4 a3 f#4 a3] [g3 d4 bb4 d4 g4 d4 bb4 d4] [d3 a3 f#4 a3 d4 a3 f#4 a3]>")
    .s("triangle").decay(0.26).sustain(0).release(0.12)
    .lpf(sine.range(350,700).slow(9))
    .gain("0.18 0.11 0.15 0.11 0.18 0.11 0.15 0.11")
    .delay(0.5).delaytime(0.25).delayfeedback(0.5)
    .room(0.8).pan(sine.slow(7).range(0.35,0.65)).degradeBy(0.25)]
)`,
  },
  {
    id: "three",
    name: "Three",
    code: `setcps(0.3)
arrange(
  [6, note("<[c3,e3,g3,d4] [f3,a3,c4,g4] [a2,c3,e3,b3] [g2,b2,d3,e3] [e3,g3,b3,d4] [f3,a3,c4,e4] [d3,f3,a3,e4] [g2,b2,d3,f3]>")
    .s("triangle").chorus(0.6).lpf(900)
    .gain(sine.range(0.08,0.15).slow(5)).room(0.9).attack(0.8).release(2)
    .phaser(0.25)],
  [6, stack(
    note("<[c3,e3,g3,d4] [f3,a3,c4,g4] [a2,c3,e3,b3] [g2,b2,d3,e3] [e3,g3,b3,d4] [f3,a3,c4,e4] [d3,f3,a3,e4] [g2,b2,d3,f3]>")
      .s("triangle").chorus(0.6).lpf(1100)
      .gain(sine.range(0.1,0.18).slow(5)).room(0.88).attack(0.6).release(1.8)
      .phaser(0.25),
    note("<c2 f2 a1 g1 e2 f2 d2 g1>").s("sine").gain(0.18).lpf(240)
  )],
  [8, stack(
    note("<[c3,e3,g3,d4] [f3,a3,c4,g4] [a2,c3,e3,b3] [g2,b2,d3,e3] [e3,g3,b3,d4] [f3,a3,c4,e4] [d3,f3,a3,e4] [g2,b2,d3,f3]>")
      .s("triangle").chorus(0.6).lpf(1300)
      .gain(sine.range(0.12,0.22).slow(5)).room(0.88).attack(0.6).release(1.8)
      .phaser(0.25).off(0.25, x => x.gain(0.07).delay(0.4)),
    n("<0 4 2 7 4 9 7 5> <2 ~ 4 ~ 7 ~ 9 ~>").scale("c:major")
      .s("triangle").trans(12)
      .gain(0.085).room(0.9).delay(0.5).delaytime(0.32).delayfeedback(0.45)
      .pan(sine.slow(6).range(0.25,0.75)).degradeBy(0.2),
    note("<c2 f2 a1 g1 e2 f2 d2 g1>").s("sine").gain(0.2).lpf(240),
    note("c1 ~ ~ ~").s("sine").decay(0.15).sustain(0).gain(0.16).lpf(180),
    s("~ ~ pink ~").hpf(6000).decay(0.02).sustain(0).gain(0.035).degradeBy(0.3)
  )],
  [8, stack(
    note("<[c3,e3,g3,d4] [f3,a3,c4,g4] [a2,c3,e3,b3] [g2,b2,d3,e3] [e3,g3,b3,d4] [f3,a3,c4,e4] [d3,f3,a3,e4] [g2,b2,d3,f3]>")
      .s("triangle").chorus(0.6).lpf(1600)
      .gain(sine.range(0.13,0.24).slow(5)).room(0.88).attack(0.6).release(1.8)
      .phaser(0.25).off(0.25, x => x.gain(0.08).delay(0.4)),
    n("<0 4 2 7 4 9 7 5>*2 <2 ~ 4 ~ 7 ~ 9 ~>").scale("c:major")
      .s("triangle").trans(12)
      .gain(0.09).room(0.9).delay(0.5).delaytime(0.32).delayfeedback(0.45)
      .pan(sine.slow(5).range(0.2,0.8)).degradeBy(0.15),
    n("<7 9 11 14 11 9>*[0.5,1]").scale("c:major")
      .s("sine").trans(12).vib(2)
      .gain(0.05).room(0.95).delay(0.6).delaytime(0.48).delayfeedback(0.5),
    note("<c2 f2 a1 g1 e2 f2 d2 g1>").s("sine").gain(0.2).lpf(240),
    note("c1 ~ ~ ~").s("sine").decay(0.15).sustain(0).gain(0.16).lpf(180),
    s("~ ~ pink ~").hpf(6000).decay(0.02).sustain(0).gain(0.04).degradeBy(0.25)
  )],
  [6, stack(
    note("<[c3,e3,g3,d4] [f3,a3,c4,g4] [a2,c3,e3,b3] [g2,b2,d3,e3] [e3,g3,b3,d4] [f3,a3,c4,e4] [d3,f3,a3,e4] [g2,b2,d3,f3]>")
      .s("triangle").chorus(0.6).lpf(1000)
      .gain(sine.range(0.09,0.16).slow(5)).room(0.92).attack(0.8).release(2)
      .phaser(0.25),
    n("<0 4 2 7 4 9 7 5> <2 ~ 4 ~ 7 ~ 9 ~>").scale("c:major")
      .s("triangle").trans(12)
      .gain(0.07).room(0.92).delay(0.55).delaytime(0.32).delayfeedback(0.5)
      .pan(sine.slow(6).range(0.25,0.75)).degradeBy(0.35)
  )],
  [8, stack(
    note("<[c3,e3,g3,d4] [f3,a3,c4,g4] [a2,c3,e3,b3] [g2,b2,d3,e3] [e3,g3,b3,d4] [f3,a3,c4,e4] [d3,f3,a3,e4] [g2,b2,d3,f3]>")
      .s("triangle").chorus(0.6).lpf(1300)
      .gain(sine.range(0.12,0.22).slow(5)).room(0.88).attack(0.6).release(1.8)
      .phaser(0.25).off(0.25, x => x.gain(0.07).delay(0.4)),
    n("<0 4 2 7 4 9 7 5> <2 ~ 4 ~ 7 ~ 9 ~>").scale("c:major")
      .s("triangle").trans(12)
      .gain(0.085).room(0.9).delay(0.5).delaytime(0.32).delayfeedback(0.45)
      .pan(sine.slow(6).range(0.25,0.75)).degradeBy(0.2),
    note("<c2 f2 a1 g1 e2 f2 d2 g1>").s("sine").gain(0.2).lpf(240),
    note("c1 ~ ~ ~").s("sine").decay(0.15).sustain(0).gain(0.16).lpf(180),
    s("~ ~ pink ~").hpf(6000).decay(0.02).sustain(0).gain(0.035).degradeBy(0.3)
  )],
  [6, stack(
    note("<[c3,e3,g3,d4] [f3,a3,c4,g4] [a2,c3,e3,b3] [g2,b2,d3,e3] [e3,g3,b3,d4] [f3,a3,c4,e4] [d3,f3,a3,e4] [g2,b2,d3,f3]>")
      .s("triangle").chorus(0.6).lpf(1100)
      .gain(sine.range(0.1,0.17).slow(5)).room(0.9).attack(0.7).release(2)
      .phaser(0.25),
    n("<0 4 2 7 4 9 7 5> <2 ~ 4 ~ 7 ~ 9 ~>").scale("c:major")
      .s("triangle").trans(12)
      .gain(0.06).room(0.92).delay(0.55).delaytime(0.32).delayfeedback(0.5)
      .pan(sine.slow(6).range(0.25,0.75)).degradeBy(0.55),
    note("<c2 f2 a1 g1 e2 f2 d2 g1>").s("sine").gain(0.16).lpf(220)
  )],
  [6, note("<[c3,e3,g3,d4] [f3,a3,c4,g4] [a2,c3,e3,b3] [g2,b2,d3,e3] [e3,g3,b3,d4] [f3,a3,c4,e4] [d3,f3,a3,e4] [g2,b2,d3,f3]>")
    .s("triangle").chorus(0.6).lpf(750)
    .gain(sine.range(0.05,0.11).slow(5)).room(0.95).attack(1).release(2.4)
    .phaser(0.25)]
)`,
  },
  {
    id: "four",
    name: "Four",
    code: `setcps(0.4)
arrange(
  [6, stack(
    note("<[e2,g2,b2] [d2,f#2,a2] [c2,e2,g2] [b1,d2,f#2]>")
      .sound("sawtooth").unison(2).detune(0.1).attack(0.6).release(1.6)
      .lpf(380).gain(0.03).room(1).roomsize("10"),
    note("<e1 d1 c1 b0>").struct("x*8")
      .s("sine").decay(0.22).sustain(0.15).release(0.1).gain(0.18).lpf(120),
    note("c1*4").s("sine").decay(0.11).sustain(0).gain(0.1).lpf(140)
  )],
  [8, stack(
    note("<[e3 g3 b3 g3 e4 b3 g3 b3] [d3 f#3 a3 f#3 d4 a3 f#3 a3] [c3 e3 g3 e3 c4 g3 e3 g3] [b2 d3 f#3 d3 b3 f#3 d3 f#3]>")
      .sound("sawtooth").decay(0.15).sustain(0.05).release(0.1)
      .lpf("<600 900 1300 1700 1300 900>/2").gain(0.12)
      .delay(1).room(1).roomsize("8").pan("<0 1>/2"),
    note("<[e2,g2,b2] [d2,f#2,a2] [c2,e2,g2] [b1,d2,f#2]>")
      .sound("sawtooth").unison(2).detune(0.1).attack(0.4).release(1.4)
      .lpf(480).gain(0.02).room(1).roomsize("10"),
    note("<e1 d1 c1 b0>").struct("x*8")
      .s("sine").decay(0.22).sustain(0.15).release(0.1).gain(0.2).lpf(130),
    note("c1*4").s("sine").decay(0.11).sustain(0).gain(0.12).lpf(140)
  )],
  [8, stack(
    note("<[e4 b3 g3 b3 e3 g3 b3 g3] [c4 g3 e3 g3 c3 e3 g3 e3] [g3 d3 b2 d3 g2 b2 d3 b2] [d4 a3 f#3 a3 d3 f#3 a3 f#3]>")
      .sound("sawtooth").decay(0.15).sustain(0.05).release(0.1)
      .lpf("<800 1200 1600 1200 900 700>/2").gain(0.115)
      .delay(1).room(1).roomsize("8").pan("<1 0>/2"),
    note("<[e2,g2,b2] [c2,e2,g2] [g1,b1,d2] [d2,f#2,a2]>")
      .sound("sawtooth").unison(2).detune(0.1).attack(0.4).release(1.4)
      .lpf(480).gain(0.02).room(1).roomsize("10"),
    note("<e1 c1 g1 d1>").struct("x*8")
      .s("sine").decay(0.22).sustain(0.15).release(0.1).gain(0.2).lpf(130),
    note("c1*4").s("sine").decay(0.11).sustain(0).gain(0.12).lpf(140)
  )],
  [8, stack(
    note("<[e3 g3 b3 g3 e4 b3 g3 b3] [d3 f#3 a3 f#3 d4 a3 f#3 a3] [c3 e3 g3 e3 c4 g3 e3 g3] [b2 d3 f#3 d3 b3 f#3 d3 f#3]>")
      .sound("sawtooth").decay(0.15).sustain(0.05).release(0.1)
      .lpf("<900 1300 1700 2100 1700 1300>/2").gain(0.12)
      .delay(1).room(1).roomsize("8").pan("<0 1>/2"),
    note("<[e4 b3 g3 b3 e3 g3 b3 g3] [c4 g3 e3 g3 c3 e3 g3 e3] [g3 d3 b2 d3 g2 b2 d3 b2] [d4 a3 f#3 a3 d3 f#3 a3 f#3]>")
      .sound("sawtooth").decay(0.14).sustain(0.04).release(0.1)
      .lpf("<1000 1400 1800 1400 1100 900>/2").gain(0.06)
      .delay(1).room(1).roomsize("8").pan("<1 0>/2"),
    note("<[e2,g2,b2] [d2,f#2,a2] [c2,e2,g2] [b1,d2,f#2]>")
      .sound("sawtooth").unison(2).detune(0.1).attack(0.4).release(1.4)
      .lpf(520).gain(0.025).room(1).roomsize("10"),
    note("<e1 d1 c1 b0>").struct("x*8")
      .s("sine").decay(0.22).sustain(0.15).release(0.1).gain(0.21).lpf(130),
    note("c1*4").s("sine").decay(0.11).sustain(0).gain(0.13).lpf(140)
  )],
  [8, stack(
    note("<[c3 ~ g3 e3 ~ c4 g3 ~] [d3 ~ a3 f#3 ~ d4 a3 ~] [e3 ~ b3 g3 ~ e4 b3 ~] [b2 ~ f#3 d3 ~ b3 f#3 ~]>")
      .sound("sawtooth").decay(0.16).sustain(0.05).release(0.1)
      .lpf("<700 1000 1400 1800 1400 1000>/2").gain(0.12)
      .delay(1).room(1).roomsize("8").pan("<0 1>/2"),
    note("<[c2,e2,g2] [d2,f#2,a2] [e2,g2,b2] [b1,d2,f#2]>")
      .sound("sawtooth").unison(2).detune(0.1).attack(0.4).release(1.4)
      .lpf(480).gain(0.02).room(1).roomsize("10"),
    note("<c1 d1 e1 b0>").struct("x ~ x x ~ x x ~")
      .s("sine").decay(0.22).sustain(0.15).release(0.1).gain(0.2).lpf(130),
    note("c1*4").s("sine").decay(0.11).sustain(0).gain(0.12).lpf(140)
  )],
  [6, stack(
    note("<[e2,g2,b2] [c2,e2,g2] [g1,b1,d2] [d2,f#2,a2]>")
      .sound("sawtooth").unison(2).detune(0.1).attack(0.9).release(2.2)
      .lpf("<520 420 340 280>/2").gain(0.04).room(1).roomsize("12"),
    note("<e1 c1 g1 d1>").struct("x ~ ~ x ~ ~ x ~")
      .s("sine").decay(0.3).sustain(0.2).release(0.2).gain(0.17).lpf(120)
  )],
  [8, stack(
    note("<[e4 b3 g3 b3 e3 g3 b3 g3] [c4 g3 e3 g3 c3 e3 g3 e3] [g3 d3 b2 d3 g2 b2 d3 b2] [d4 a3 f#3 a3 d3 f#3 a3 f#3]>")
      .sound("sawtooth").decay(0.15).sustain(0.05).release(0.1)
      .lpf("<800 1200 1600 1200 900 700>/2").gain(0.115)
      .delay(1).room(1).roomsize("8").pan("<1 0>/2"),
    note("<[e2,g2,b2] [c2,e2,g2] [g1,b1,d2] [d2,f#2,a2]>")
      .sound("sawtooth").unison(2).detune(0.1).attack(0.4).release(1.4)
      .lpf(480).gain(0.02).room(1).roomsize("10"),
    note("<e1 c1 g1 d1>").struct("x*8")
      .s("sine").decay(0.22).sustain(0.15).release(0.1).gain(0.2).lpf(130),
    note("c1*4").s("sine").decay(0.11).sustain(0).gain(0.12).lpf(140)
  )],
  [8, stack(
    note("<[e3 g3 b3 g3 e4 b3 g3 b3] [d3 f#3 a3 f#3 d4 a3 f#3 a3] [c3 e3 g3 e3 c4 g3 e3 g3] [b2 d3 f#3 d3 b3 f#3 d3 f#3]>")
      .sound("sawtooth").decay(0.16).sustain(0.05).release(0.12)
      .lpf("<700 550 420 320 260 200>/2").gain(0.09)
      .delay(1).room(1).roomsize("10").pan("<0 1>/2").degradeBy(0.2),
    note("<e1 d1 c1 b0>").struct("x ~ x ~ x ~ ~ ~")
      .s("sine").decay(0.3).sustain(0.18).release(0.2).gain(0.16).lpf(120)
  )]
)`,
  },
  {
    id: "five",
    name: "Five",
    code: `setcps(0.3)
arrange(
  [6, stack(
    note("<[f3,a3,c4,e4] [d3,f3,a3,c4] [bb2,d3,f3,a3] [c3,e3,g3,bb3]>")
      .s("sawtooth").unison(2).detune(0.12).chorus(0.5)
      .lpf(700).gain(0.02).room(0.92).attack(1).release(2.4).phaser(0.3),
    note("<f2 d2 bb1 c2>").s("sine").gain(0.15).lpf(220)
  )],
  [8, stack(
    n("<0 2 4 7 9 7 4 2>*2").scale("f:major:pentatonic")
      .s("triangle").vib(2.5)
      .lpf(sine.range(700,1800).slow(9))
      .gain(0.14).room(0.85).delay(0.5).delaytime(0.28).delayfeedback(0.5)
      .pan(sine.slow(7).range(0.2,0.8)).degradeBy(0.15),
    note("<[f3,a3,c4,e4] [d3,f3,a3,c4] [bb2,d3,f3,a3] [c3,e3,g3,bb3]>")
      .s("sawtooth").unison(2).detune(0.12).chorus(0.5)
      .lpf(900).gain(0.02).room(0.9).attack(0.8).release(2).phaser(0.3),
    note("<f2 d2 bb1 c2>").s("sine").gain(0.18).lpf(220)
  )],
  [8, stack(
    n("<9 7 4 2 0 2 4 7>*2").scale("f:major:pentatonic")
      .s("triangle").vib(2.5)
      .lpf(sine.range(650,1600).slow(10))
      .gain(0.14).room(0.85).delay(0.5).delaytime(0.28).delayfeedback(0.5)
      .pan(sine.slow(6).range(0.25,0.75)).degradeBy(0.15),
    note("<[f3,a3,c4,e4] [d3,f3,a3,c4] [bb2,d3,f3,a3] [c3,e3,g3,bb3]>")
      .s("sawtooth").unison(2).detune(0.12).chorus(0.5)
      .lpf(900).gain(0.02).room(0.9).attack(0.8).release(2).phaser(0.3),
    note("<f2 d2 bb1 c2>").s("sine").gain(0.18).lpf(220)
  )],
  [8, stack(
    n("<0 2 4 7 9 7 4 2>*2").scale("f:major:pentatonic")
      .s("triangle").vib(2.5)
      .lpf(sine.range(800,2100).slow(8))
      .gain(0.15).room(0.85).delay(0.5).delaytime(0.28).delayfeedback(0.5)
      .pan(sine.slow(7).range(0.2,0.8)).degradeBy(0.1),
    n("<12 14 16 19 21 19 16 14>*2").scale("f:major:pentatonic")
      .s("sine").vib(3)
      .gain(0.05).room(0.92).delay(0.6).delaytime(0.42).delayfeedback(0.5)
      .pan(sine.slow(5).range(0.3,0.7)).degradeBy(0.3),
    note("<[f3,a3,c4,e4] [d3,f3,a3,c4] [bb2,d3,f3,a3] [c3,e3,g3,bb3]>")
      .s("sawtooth").unison(2).detune(0.12).chorus(0.5)
      .lpf(1100).gain(0.025).room(0.9).attack(0.8).release(2).phaser(0.3),
    note("<f2 d2 bb1 c2>").s("sine").gain(0.19).lpf(220)
  )],
  [6, stack(
    n("<0 2 4 7 9 7 4 2>*2").scale("f:major:pentatonic")
      .s("triangle").vib(2.5)
      .lpf(sine.range(600,1400).slow(9))
      .gain(0.13).room(0.88).delay(0.55).delaytime(0.28).delayfeedback(0.5)
      .pan(sine.slow(7).range(0.2,0.8)).degradeBy(0.2),
    note("<f2 d2 bb1 c2>").s("sine").gain(0.17).lpf(220)
  )],
  [8, stack(
    n("<0 2 4 7 9 7 4 2>*2").scale("f:major:pentatonic")
      .s("triangle").vib(2.5)
      .lpf(sine.range(700,1800).slow(9))
      .gain(0.14).room(0.85).delay(0.5).delaytime(0.28).delayfeedback(0.5)
      .pan(sine.slow(7).range(0.2,0.8)).degradeBy(0.15),
    note("<[f3,a3,c4,e4] [d3,f3,a3,c4] [bb2,d3,f3,a3] [c3,e3,g3,bb3]>")
      .s("sawtooth").unison(2).detune(0.12).chorus(0.5)
      .lpf(900).gain(0.02).room(0.9).attack(0.8).release(2).phaser(0.3),
    note("<f2 d2 bb1 c2>").s("sine").gain(0.18).lpf(220)
  )],
  [6, stack(
    n("<0 2 4 7 9 7 4 2>").scale("f:major:pentatonic")
      .s("triangle").vib(2)
      .lpf(sine.range(500,1100).slow(10))
      .gain(0.11).room(0.9).delay(0.6).delaytime(0.28).delayfeedback(0.55)
      .pan(sine.slow(7).range(0.25,0.75)).degradeBy(0.4),
    note("<[f3,a3,c4,e4] [d3,f3,a3,c4] [bb2,d3,f3,a3] [c3,e3,g3,bb3]>")
      .s("sawtooth").unison(2).detune(0.12).chorus(0.5)
      .lpf(750).gain(0.018).room(0.92).attack(1).release(2.2).phaser(0.3)
  )],
  [4, note("<[f3,a3,c4,e4] [d3,f3,a3,c4] [bb2,d3,f3,a3] [c3,e3,g3,bb3]>")
    .s("sawtooth").unison(2).detune(0.12).chorus(0.5)
    .lpf(550).gain(0.014).room(0.95).attack(1.4).release(2.8).phaser(0.3)]
)`,
  },
  {
    id: "six",
    name: "Six",
    code: `setcps(0.22)
arrange(
  [4, note("<[g2,b2,d3,f#3] [c3,e3,g3,b3]>")
    .s("sawtooth").unison(3).detune(0.18).chorus(0.4)
    .lpf(sine.range(220,520).slow(18)).lpq(5)
    .gain(0.07).room(0.97).size(0.9).attack(2.5).release(4.5).phaser(0.3)],
  [6, stack(
    note("<[g2,b2,d3,f#3] [c3,e3,g3,b3]>")
      .s("sawtooth").unison(3).detune(0.18).chorus(0.4)
      .lpf(sine.range(260,700).slow(20)).lpq(5)
      .gain(0.09).room(0.95).size(0.9).attack(2).release(4).phaser(0.3),
    note("<g1 c2>").s("sine").gain(0.11).lpf(190)
  )],
  [8, stack(
    note("<[g2,b2,d3,f#3] [c3,e3,g3,b3]>")
      .s("sawtooth").unison(3).detune(0.18).chorus(0.4)
      .lpf(sine.range(300,900).slow(20)).lpq(5)
      .gain(0.11).room(0.95).size(0.9).attack(2).release(4).phaser(0.3),
    note("<g1 c2>").s("sine").gain(0.13).lpf(190),
    note("<g1 ~ ~ ~ ~ ~ ~ ~>").s("sine").decay(0.3).sustain(0).gain(0.09).lpf(120)
  )],
  [6, stack(
    note("<[a2,c3,e3,g3] [d3,f#3,a3,c4]>")
      .s("sawtooth").unison(3).detune(0.18).chorus(0.4)
      .lpf(sine.range(300,900).slow(18)).lpq(5)
      .gain(0.11).room(0.95).size(0.9).attack(2).release(4).phaser(0.3),
    note("<a1 d2>").s("sine").gain(0.13).lpf(190),
    note("<a1 ~ ~ ~ ~ ~ ~ ~>").s("sine").decay(0.3).sustain(0).gain(0.09).lpf(120)
  )],
  [8, stack(
    note("<[g2,b2,d3,f#3] [c3,e3,g3,b3] [a2,c3,e3,g3] [c3,e3,g3,b3]>")
      .s("sawtooth").unison(3).detune(0.18).chorus(0.4)
      .lpf(sine.range(340,1100).slow(16)).lpq(5)
      .gain(0.12).room(0.95).size(0.9).attack(1.8).release(4).phaser(0.3),
    note("<g3 b3 e4 d4>*[0.5,1]")
      .s("sine").vib(1.5)
      .gain(0.045).room(0.97).delay(0.5).delaytime(0.6).delayfeedback(0.5),
    note("<g1 c2 a1 c2>").s("sine").gain(0.13).lpf(190),
    note("<g1 ~ ~ ~ ~ ~ ~ ~>").s("sine").decay(0.3).sustain(0).gain(0.1).lpf(120)
  )],
  [4, stack(
    note("<[g2,b2,d3,f#3] [c3,e3,g3,b3]>")
      .s("sawtooth").unison(3).detune(0.18).chorus(0.4)
      .lpf(sine.range(240,600).slow(18)).lpq(5)
      .gain(0.08).room(0.97).size(0.9).attack(2.4).release(4.4).phaser(0.3),
    note("<g1 c2>").s("sine").gain(0.1).lpf(180)
  )],
  [4, note("<[g2,b2,d3,f#3] [c3,e3,g3,b3]>")
    .s("sawtooth").unison(3).detune(0.18).chorus(0.4)
    .lpf(sine.range(180,380).slow(16)).lpq(5)
    .gain(0.055).room(0.98).size(0.95).attack(3).release(5).phaser(0.3)]
)`,
  },
];
