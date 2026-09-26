import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { HookScene } from "./scenes/HookScene";
import { MeetCapyScene } from "./scenes/MeetCapyScene";
import { QuestionsScene } from "./scenes/QuestionsScene";
import { PlanScene } from "./scenes/PlanScene";
import { AdaptScene } from "./scenes/AdaptScene";
import { OutroScene } from "./scenes/OutroScene";

// 135 + 165 + 165 + 165 + 180 + 165 = 975 frames, minus 5 transitions × 15 = 900 frames (30 s at 30 fps).
export const CapyPromo = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Hook" durationInFrames={135}>
      <HookScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-bottom" })}
      timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Meet Capy" durationInFrames={165}>
      <MeetCapyScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-right" })}
      timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Questions" durationInFrames={165}>
      <QuestionsScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-right" })}
      timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Plan" durationInFrames={165}>
      <PlanScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-bottom" })}
      timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Adapt" durationInFrames={180}>
      <AdaptScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Outro" durationInFrames={165}>
      <OutroScene />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
