import * as React from "react";
import "./LoadingScreen.scss";

export function LoadingScreen() {
  const [progress, setProgress] = React.useState(0);
  const [dots, setDots] = React.useState("");

  React.useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(progressInterval);
  }, []);

  React.useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots.length === 3) {
          return "";
        }
        return prevDots + ".";
      });
    }, 460);
    return () => clearInterval(dotsInterval);
  }, []);

  return (
    <div className="LoadingScreen">
      <a href="https://www.magicblock.gg">
        <img
          src="https://i.ibb.co/Fx7gQ4r/Github-readme-img-1.png"
          alt="Magicblock Labs"
          width={500}
        />
      </a>

      <p className="GameDescription">THE CLASSIC CASTLE COMBAT GAME</p>

      <p className="GameTitle">BATTLEGROUND</p>

      <p className="Edition">ALPA EDITION</p>

      <div className="ProgressBar">
        <div
          className="ProgressBarFill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="LoaderText">Loading {dots}</p>

      <p className="CraftedBy"> Crafted with ❤️️ by Magicblock Labs</p>
    </div>
  );
}
