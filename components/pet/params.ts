// Tuned animation parameters.
export const PARAMS = {
  man: {
    speed: 220, // walking speed, px/s
    stepRate: 15, // walk-cycle frames per second
    pixelSize: 3, // sprite scale (1 grid cell = 3px)
    color: "#f5f5f0",
    pauseSeconds: 5, // rest time at each destination
  },
  dog: {
    speed: 210,
    stepRate: 17.5,
    pixelSize: 2,
    color: "#f5f5f0",
    leash: 180, // max roam distance from the man, px
    pauseSeconds: 4,
    wagRate: 4, // idle tail wags per second
  },
  sound: {
    enabled: true,
    volume: 0.52, // master volume, 0-1
  },
  edgeMargin: 80, // keeps wander targets away from screen edges
  shadow: false, // soft ellipse shadows under both characters
};
