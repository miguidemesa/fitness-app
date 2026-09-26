import "./index.css";
import { Composition, Folder } from "remotion";
import { CapyPromo } from "./CapyPromo";
import { HookScene } from "./scenes/HookScene";
import { MeetCapyScene } from "./scenes/MeetCapyScene";
import { QuestionsScene } from "./scenes/QuestionsScene";
import { PlanScene } from "./scenes/PlanScene";
import { AdaptScene } from "./scenes/AdaptScene";
import { OutroScene } from "./scenes/OutroScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CapyPromo"
        component={CapyPromo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={900}
      />
      <Folder name="CapyPromo-Scenes">
        <Composition
          id="Hook"
          component={HookScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={135}
        />
        <Composition
          id="MeetCapy"
          component={MeetCapyScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={165}
        />
        <Composition
          id="Questions"
          component={QuestionsScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={165}
        />
        <Composition
          id="Plan"
          component={PlanScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={165}
        />
        <Composition
          id="Adapt"
          component={AdaptScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={180}
        />
        <Composition
          id="Outro"
          component={OutroScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={165}
        />
      </Folder>
    </>
  );
};
